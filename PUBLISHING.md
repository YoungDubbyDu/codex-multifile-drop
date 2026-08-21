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

## Marketplace

The extension is published at:

https://marketplace.visualstudio.com/items?itemName=youngdubbydu.codex-multifile-drop

For a new release:

1. Update the version in `package.json` and add the release notes to
   `CHANGELOG.md`.
2. Run `npm install` and `npm run package`.
3. Inspect the generated VSIX with `npx vsce ls --no-dependencies`.
4. Sign in to the Visual Studio Marketplace publisher management page.
5. Open **Codex File Drop**, select **Update**, and upload the new VSIX.
6. Confirm that the public listing shows the new version before creating the
   matching GitHub release.

Manual upload keeps Marketplace credentials out of the repository and local
shell history. Future releases can use `npm run publish` after configuring the
publisher credentials according to the official VS Code documentation.
