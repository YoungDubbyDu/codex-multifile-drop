const vscode = require("vscode");

const CODEX_ADD_FILE_COMMAND = "chatgpt.addFileToThread";
const URI_LIST_MIME = "text/uri-list";
const DROP_MIME_TYPES = [
  URI_LIST_MIME,
  "files",
  "text/plain",
  "application/vnd.code.resource",
  "application/vnd.code.tree.workbench.explorer.fileview",
  "application/vnd.code.tree.explorer",
  "codefiles",
  "resourceurls",
];

let outputChannel;

class DropTargetProvider {
  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (element) {
      return [];
    }

    const item = new vscode.TreeItem(
      "Drop selected files here",
      vscode.TreeItemCollapsibleState.None,
    );
    item.description = "Add to the current Codex thread";
    item.tooltip = "Select files in Explorer, then drop them on this row";
    item.iconPath = new vscode.ThemeIcon("cloud-upload");
    item.contextValue = "codexMultiFileDropTarget";
    item.command = {
      command: "codexMultiFileDrop.pickFiles",
      title: "Pick multiple files for Codex",
    };
    return [item];
  }
}

function toCodexFileUri(uri) {
  if (!uri) {
    return null;
  }
  if (uri.scheme === "file") {
    return uri;
  }
  if (uri.scheme === "vscode-remote") {
    return vscode.Uri.file(uri.path);
  }
  return null;
}

function uniqueCodexUris(uris) {
  const seen = new Set();
  const result = [];
  for (const rawUri of uris) {
    const uri = toCodexFileUri(rawUri);
    if (!uri) {
      continue;
    }
    const key = uri.fsPath;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(uri);
    }
  }
  return result;
}

function parseUriList(value) {
  const uris = [];
  for (const line of value.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    try {
      uris.push(vscode.Uri.parse(trimmed));
    } catch {
      // Ignore malformed drag entries and continue with the remaining files.
    }
  }
  return uniqueCodexUris(uris);
}

function collectUriCandidates(value, uris, visited = new Set(), depth = 0) {
  if (value == null || depth > 8) {
    return;
  }

  if (value instanceof vscode.Uri) {
    uris.push(value);
    return;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        collectUriCandidates(JSON.parse(trimmed), uris, visited, depth + 1);
        return;
      } catch {
        // Continue with line-oriented parsing.
      }
    }

    for (const line of trimmed.split(/\r?\n/)) {
      const candidate = line.trim();
      if (!candidate || candidate.startsWith("#")) {
        continue;
      }
      try {
        if (
          candidate.startsWith("file:") ||
          candidate.startsWith("vscode-remote:")
        ) {
          uris.push(vscode.Uri.parse(candidate));
        } else if (
          candidate.startsWith("/") ||
          /^[A-Za-z]:[\\/]/.test(candidate)
        ) {
          uris.push(vscode.Uri.file(candidate));
        }
      } catch {
        // Ignore malformed candidates and continue.
      }
    }
    return;
  }

  if (typeof value !== "object" || visited.has(value)) {
    return;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      collectUriCandidates(item, uris, visited, depth + 1);
    }
    return;
  }

  if (typeof value.scheme === "string" && typeof value.path === "string") {
    try {
      uris.push(
        vscode.Uri.from({
          scheme: value.scheme,
          authority: typeof value.authority === "string" ? value.authority : "",
          path: value.path,
          query: typeof value.query === "string" ? value.query : "",
          fragment: typeof value.fragment === "string" ? value.fragment : "",
        }),
      );
    } catch {
      // Continue recursively in case another field contains a usable URI.
    }
  }

  for (const nested of Object.values(value)) {
    collectUriCandidates(nested, uris, visited, depth + 1);
  }
}

async function extractUrisFromDataTransfer(dataTransfer) {
  const uris = [];
  const diagnostics = [];

  for (const [mimeType, item] of dataTransfer) {
    const diagnostic = { mimeType, preview: "" };

    try {
      const file = item.asFile?.();
      if (file?.uri) {
        uris.push(file.uri);
        diagnostic.preview = `[file] ${file.name}`;
      }
    } catch {
      // Some Cursor data-transfer items do not implement file access.
    }

    try {
      collectUriCandidates(item.value, uris);
    } catch {
      // Fall through to the string representation.
    }

    try {
      const stringValue = await item.asString();
      collectUriCandidates(stringValue, uris);
      if (!diagnostic.preview) {
        diagnostic.preview = stringValue.slice(0, 500);
      }
    } catch {
      diagnostic.preview ||= "[unreadable]";
    }

    diagnostics.push(diagnostic);
  }

  return { uris: uniqueCodexUris(uris), diagnostics };
}

async function pickFilesForCodex() {
  const selected = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: true,
    defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
    openLabel: "Add to current Codex thread",
    title: "Select one or more files",
  });
  if (selected?.length) {
    await addFilesToCodex(selected);
  }
}

async function addFilesToCodex(uris) {
  const files = uniqueCodexUris(uris);
  if (files.length === 0) {
    void vscode.window.showWarningMessage(
      "No workspace files were recognized for Codex.",
    );
    return;
  }

  const commandExists = (await vscode.commands.getCommands(true)).includes(
    CODEX_ADD_FILE_COMMAND,
  );
  if (!commandExists) {
    void vscode.window.showErrorMessage(
      "Codex's Add File to Thread command was not found. Make sure the official OpenAI Codex extension is enabled.",
    );
    return;
  }

  let added = 0;
  for (const uri of files) {
    try {
      await vscode.commands.executeCommand(CODEX_ADD_FILE_COMMAND, uri);
      added += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      void vscode.window.showErrorMessage(
        `Failed to add ${uri.fsPath}: ${message}`,
      );
      return;
    }
  }

  void vscode.window.setStatusBarMessage(
    `$(check) Added ${added} file(s) to the current Codex thread`,
    5000,
  );
}

function activate(context) {
  outputChannel = vscode.window.createOutputChannel("Codex Multi-file Drop");
  const provider = new DropTargetProvider();
  const dragAndDropController = {
    dragMimeTypes: [],
    dropMimeTypes: DROP_MIME_TYPES,
    async handleDrop(_target, dataTransfer) {
      const { uris, diagnostics } =
        await extractUrisFromDataTransfer(dataTransfer);
      outputChannel.appendLine(
        `[drop] ${new Date().toISOString()} MIME: ${diagnostics
          .map((entry) => entry.mimeType)
          .join(", ") || "(empty)"}`,
      );
      for (const entry of diagnostics) {
        outputChannel.appendLine(
          `[drop] ${entry.mimeType}: ${entry.preview || "[empty]"}`,
        );
      }

      if (uris.length === 0) {
        const mimeSummary =
          diagnostics.map((entry) => entry.mimeType).join(", ") || "empty";
        const action = await vscode.window.showWarningMessage(
          `The editor did not provide parseable file URIs (MIME: ${mimeSummary}).`,
          "Pick multiple files",
          "Show diagnostics",
        );
        if (action === "Pick multiple files") {
          await pickFilesForCodex();
        } else if (action === "Show diagnostics") {
          outputChannel.show(true);
        }
        return;
      }
      await addFilesToCodex(uris);
    },
  };

  const treeView = vscode.window.createTreeView(
    "codexMultiFileDrop.dropZone",
    {
      treeDataProvider: provider,
      dragAndDropController,
      showCollapseAll: false,
    },
  );
  treeView.message = "Select files above, then drop them on the row below.";

  const command = vscode.commands.registerCommand(
    "codexMultiFileDrop.addSelectedFiles",
    async (primaryUri, selectedUris) => {
      const candidates =
        Array.isArray(selectedUris) && selectedUris.length > 0
          ? selectedUris
          : primaryUri
            ? [primaryUri]
            : [];
      await addFilesToCodex(candidates);
    },
  );

  const pickCommand = vscode.commands.registerCommand(
    "codexMultiFileDrop.pickFiles",
    pickFilesForCodex,
  );

  context.subscriptions.push(treeView, command, pickCommand, outputChannel);
}

function deactivate() {}

module.exports = { activate, deactivate };
