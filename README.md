# Multi-file Drop for Codex

English | [简体中文](README.zh-CN.md)

Send multiple files or folders from the VS Code or Cursor Explorer to the
current Codex thread in one operation.

## Why this extension exists

The Codex composer uses a webview. In some local, Remote-SSH, and Cursor setups,
dragging resources from Explorer into the composer does not provide usable file
URIs.

This extension bypasses that path:

```text
Explorer file or folder selection
  -> native VS Code TreeView drop target
  -> chatgpt.addFileToThread once per resource
  -> resources appear in the current Codex thread
```

## Features

- Native Explorer drop target: `CODEX: DROP FILES HERE`
- Batch Explorer context-menu action
- File and folder handoff
- Local VS Code and Remote-SSH support
- Cursor MIME compatibility and diagnostics
- Multi-file picker fallback when an editor omits drag URIs
- No telemetry, network requests, native binaries, or third-party dependencies

## Requirements

- VS Code-compatible editor version `1.100.0` or newer
- Codex extension enabled (`openai.chatgpt`)

## Install

1. Download `codex-multifile-drop-0.2.1.vsix` from the latest GitHub Release.
2. In VS Code or Cursor, right-click the VSIX and choose
   `Install Extension VSIX`, or run:

   ```bash
   code --install-extension codex-multifile-drop-0.2.1.vsix --force
   ```

3. Run `Developer: Reload Window`.

For Remote-SSH, install the VSIX from a window already connected to the remote
host.

## Use

### Drag and drop

1. Select one or more files or folders in Explorer.
2. Drag them to `CODEX: DROP FILES HERE`.
3. The resources are added to the current Codex thread.

### Explorer context menu

Select multiple files or folders, right-click, and run:

```text
Codex: Add ALL Selected Files to Current Thread
```

### File picker

Click `Drop selected files here` in the drop-target view to open a multi-file
picker. The picker selects files only; use drag-and-drop or the Explorer context
menu to add folders.

## Folder behavior

Adding a folder passes its path to Codex. The extension does not eagerly expand
the directory and attach every file. Codex can inspect the folder as needed for
the task.

## Verified environments

- VS Code `1.133.0`, including Remote-SSH
- Cursor `3.16.17`, including Remote-SSH
- OpenAI Codex extension `26.810.41047` and `26.5810.41047`

Other versions may work but have not yet been verified.

## Privacy and security

The extension does not send network requests or collect telemetry. It passes
selected workspace resource URIs to the Codex extension through
`chatgpt.addFileToThread`. Cursor drag diagnostics remain in the local Output
panel and may contain local file paths.

## Limitations

- Files that exist only on a local desktop must first be available to the editor
  or remote workspace.
- The extension depends on the Codex command ID
  `chatgpt.addFileToThread`. A future Codex update could rename or remove it.
- It cannot inject custom UI directly into the Codex composer.

## License

[MIT](LICENSE)
