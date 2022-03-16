'use strict'

const vscode = require('vscode')

const DevTodoList = require('./DevTodoList')
const DevTodoListProvider = require('./DevTodoListProvider')

const WelcomePane = require('./welcome')

/**
 * Handle Activating Extension
 * @param {*} context
 */
function activate(context) {
  // Get Extension Version Info
  const currentVersion = context.globalState.get('dev-todo-vscode-extension.version')
  const packageVersion = vscode.extensions.getExtension('RedVanWorkshop.dev-todo-list').packageJSON.version

  // Check if there was a recent change to installed version
  if (currentVersion !== packageVersion) {
    // Update version number so we don't show this again until next update
    context.globalState.update('dev-todo-vscode-extension.version', packageVersion)

    // Show Welcome Modal since this is a new version or install
    const welcome = new WelcomePane(context)
    welcome.show()
  }

  // Create ToDo Object
  const devTodoList = new DevTodoList(context)

  // Initialize Tree View Providers
  const devTodoListProvider = new DevTodoListProvider(context)

  // Register Tree Data Providers to Workspace
  vscode.window.createTreeView('devTodoListView', { treeDataProvider: devTodoListProvider, showCollapseAll: true })

  // Register Commands
  const devTodoListUpdated = vscode.commands.registerCommand('extension.devTodoList.updated', (treeData) => devTodoListProvider.refresh(treeData))
  const openSettings = vscode.commands.registerCommand('extension.devTodoList.openSettings', () => vscode.commands.executeCommand('workbench.action.openSettings', 'extension.devTodoList'))
  const refreshDevTodoList = vscode.commands.registerCommand('extension.devTodoList.refresh', () => devTodoList.refresh(false))

  // Listen for Config Change of Overrides and Regenerate Tree when Changed
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((evt) => {
      // Check if Pattern was Changed
      const patternChanged = evt.affectsConfiguration('extension.devTodoList.pattern')

      // Check if we should update Cartridge List
      if (patternChanged) {
        devTodoList.refresh(true)
        devTodoListProvider.reset()
      }
    })
  )

  // Update VS Code Extension Subscriptions
  context.subscriptions.push(devTodoListUpdated)
  context.subscriptions.push(openSettings)
  context.subscriptions.push(refreshDevTodoList)
}

/**
 * Handle Deactivating Extension
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
