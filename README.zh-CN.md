# Codex File Drop

[English](README.md) | 简体中文

<p align="center">
  <img src="assets/icon.png" alt="Codex File Drop 图标" width="160">
</p>

将 VS Code 或 Cursor Explorer 中的多份文件、多个文件夹拖放或批量加入当前
Codex 对话，也支持 Remote-SSH。

## 为什么需要这个扩展

Codex 对话框使用 Webview。在部分本地、Remote-SSH 和 Cursor 环境中，从
Explorer 直接向对话框拖入文件时，Webview 无法获得可用的文件 URI。

本扩展绕过这条链路：

```text
Explorer 多选文件或文件夹
  -> VS Code 原生 TreeView 投放区
  -> 逐个调用 chatgpt.addFileToThread
  -> 文件或文件夹自动出现在当前 Codex 对话中
```

## 功能

- Explorer 原生投放区：`CODEX: DROP FILES HERE`
- Explorer 多选右键批量添加
- 支持文件和文件夹
- 支持本地 VS Code 和 Remote-SSH
- 支持 Cursor 拖拽格式并提供诊断信息
- 编辑器不提供拖拽 URI 时，可通过多文件选择器添加
- 无遥测、无网络请求、无原生二进制文件、无第三方依赖

## 环境要求

- VS Code 兼容编辑器 `1.100.0` 或更高版本
- 已安装并启用 Codex 扩展（`openai.chatgpt`）

## 从扩展市场安装

在扩展面板搜索 `Codex File Drop`，点击**安装**。

## 通过 VSIX 安装

1. 从 [GitHub 最新版本](https://github.com/YoungDubbyDu/codex-multifile-drop/releases/latest)
   下载 VSIX。
2. 在 VS Code 或 Cursor 的 Explorer 中右键 VSIX，选择
   `Install Extension VSIX`；也可以在终端执行：

   ```bash
   code --install-extension codex-multifile-drop-*.vsix --force
   ```

3. 执行 `Developer: Reload Window`。

使用 Remote-SSH 时，请在已经连接远端的窗口中安装 VSIX。

## 使用方法

### 拖放

1. 在 Explorer 中多选文件或文件夹。
2. 拖到 Explorer 底部的 `CODEX: DROP FILES HERE`。
3. 文件或文件夹会自动加入当前 Codex 对话。

### 右键批量添加

在 Explorer 中多选文件或文件夹，右键选择：

```text
Codex: Add ALL Selected Files to Current Thread
```

### 文件选择器

点击投放区中的 `Drop selected files here`，可以通过文件选择器一次选择
多份文件。文件选择器只选择文件；添加文件夹请使用拖放或 Explorer 右键。

## 文件夹行为

添加文件夹时，扩展会将文件夹路径交给 Codex。它不会立即遍历并把目录中的
所有文件全部加入上下文；Codex 可以根据任务需要读取该目录。

## 已验证环境

- VS Code `1.133.0`，包括 Remote-SSH
- Cursor `3.16.17`，包括 Remote-SSH
- OpenAI Codex 扩展 `26.810.41047` 和 `26.5810.41047`

其他版本可能同样可用，但尚未验证。

## 隐私与安全

扩展不发送网络请求，也不收集遥测数据。它只会将用户选择的工作区文件 URI
通过 `chatgpt.addFileToThread` 交给 Codex 扩展。Cursor 拖拽诊断信息仅保留
在本地 Output 面板中，其中可能包含本地文件路径。

## 限制

- 只存在于本机桌面、尚未进入当前编辑器或远端工作区的文件，需要先上传。
- 扩展依赖命令 `chatgpt.addFileToThread`；未来 Codex 更新可能修改该命令。
- 扩展不能把自定义界面直接注入 Codex 对话输入框。

## License

[MIT](LICENSE)
