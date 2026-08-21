# Multi-file Drop for Codex (Unofficial)

Reliably send multiple files from the VS Code or Cursor Explorer to the
official `Codex - OpenAI's coding agent` extension.

This is an independent community extension. It is not developed, endorsed, or
supported by OpenAI.

## Why this exists

The official Codex composer is a webview. In some local, Remote-SSH, and Cursor
setups, dragging files from Explorer into that composer does not provide usable
file URIs. Parsing the webview drop event cannot recover data that the editor
never delivered.

This extension avoids that boundary:

```text
Explorer multi-selection
  -> native VS Code TreeView drop target
  -> chatgpt.addFileToThread once per file
  -> file chips appear in the current Codex composer
```

## Features

- Native Explorer drop target: `CODEX: DROP FILES HERE`
- Multi-file Explorer context-menu action
- Local VS Code and Remote-SSH support
- Cursor MIME compatibility and diagnostics
- Multi-file picker fallback when an editor omits drag URIs
- No telemetry, network requests, native binaries, or third-party dependencies

## Requirements

- VS Code-compatible editor version `1.100.0` or newer
- Official Codex extension enabled (`openai.chatgpt`)

## Install from VSIX

1. Download `codex-multifile-drop-0.2.0.vsix` from the latest GitHub Release.
2. In VS Code or Cursor, right-click the VSIX and choose
   `Install Extension VSIX`, or run:

   ```bash
   code --install-extension codex-multifile-drop-0.2.0.vsix --force
   ```

3. Run `Developer: Reload Window`.

For Remote-SSH, install the VSIX from a window already connected to the remote
host.

## Use

1. Select one or more files in Explorer.
2. Drag them to `CODEX: DROP FILES HERE`.
3. Confirm that the same number of file chips appears in the current Codex
   composer.

Alternatives:

- Right-click the Explorer selection and run
  `Codex: Add ALL Selected Files to Current Thread`.
- Click the drop-target row to open a multi-file picker.

## Verified environments

- VS Code `1.133.0`, including Remote-SSH
- Cursor `3.16.17`, including Remote-SSH
- OpenAI Codex extension `26.810.41047` and `26.5810.41047`

Other versions may work but have not yet been verified.

## Privacy and security

The extension does not send network requests or collect telemetry. It passes
selected workspace file URIs to the official Codex extension through
`chatgpt.addFileToThread`. Cursor drag diagnostics remain in the local VS Code
Output panel and may contain local file paths.

## Limitations

- Files that exist only on a local desktop must first be available to the editor
  or remote workspace.
- The extension depends on the Codex command ID
  `chatgpt.addFileToThread`. A future Codex update could rename or remove it.
- It cannot inject custom UI directly into the official Codex composer.

## Related work

[Codex Link](https://github.com/lcwlucky/codex-link-vscode-plugin) provides a
broader set of Codex handoff actions. This project is independently implemented
and focuses on a minimal native TreeView drop path that remains usable when
webview drag-and-drop fails, including in verified Remote-SSH and Cursor setups.

## 中文说明

这是一个非官方的 VS Code/Cursor 辅助扩展，用于把 Explorer 中多选的文件
批量加入当前 Codex 对话。它通过 VS Code 原生 TreeView 接收拖放，再调用
官方 Codex 扩展的文件上下文命令，因此能够绕过聊天 Webview 收不到文件
拖拽数据的问题。

安装后执行 `Developer: Reload Window`，在 Explorer 底部找到
`CODEX: DROP FILES HERE`，多选文件后拖到该区域即可。

## License

[MIT](LICENSE)
