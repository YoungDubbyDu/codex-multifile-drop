# Publishing

## Package locally

This project pins the official VS Code extension packaging tool to a version
compatible with Node.js 18 and newer.

```bash
npm install
npm run package
```

Inspect the generated VSIX before publishing:

```bash
npx vsce ls --no-dependencies
```

## First Marketplace release

1. Sign in at the Visual Studio Marketplace publisher management page.
2. Create the publisher ID `youngdubbydu`. Publisher IDs cannot be renamed.
3. Select **New extension** and **Visual Studio Code**.
4. Upload `codex-multifile-drop-0.2.2.vsix`.
5. Confirm that the public listing shows the display name `Codex File Drop`,
   publisher `youngdubbydu`, icon, README, repository, and MIT license.

Manual upload keeps Marketplace credentials out of the repository and local
shell history. Future releases can use `npm run publish` after configuring the
publisher credentials according to the official VS Code documentation.
