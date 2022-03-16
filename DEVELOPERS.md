Developer Setup
===

Extension Development
---

> To develop this extension in VS Code:

1. Open File `extension.code-workspace` in VS Code
2. Run `npm install` in VS Code Terminal
3. Press `F5` to launch extension in a new VS Code window

NOTE: The first time you press `F5` it may launch in an empty workspace.

Multilingual Support
---

> Want this extension in another language? Translations for [VS Code Supported Locales](https://code.visualstudio.com/docs/getstarted/locales#_available-locales) can easily be added:

**To make a Translation:**

1. Open `package.nls.json`
2. Save as a new file with language code, e.g. `Spanish` would be `package.nls.es.json`
3. Update JSON Values with your custom language
4. Double check everything works
5. Submit a Pull Request with a new translation file
