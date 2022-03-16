'use strict'

const vscode = require('vscode')
const { init, localize } = require('vscode-nls-i18n')

const Cache = require('./Cache')
const util = require('./util')

/**
 * Dev Todo List
 */
class DevTodoList {
  /**
   * Initialize Cartridges
   */
  constructor(context) {
    // Initialize Localization
    init(context.extensionPath)

    // Create Cache Instances
    this.cachedDevTodoList = new Cache(context, 'devTodoList')

    // Establish VS Code Context
    this.context = context

    // Fetch Search Pattern from Configuration
    this.searchPattern = this.getSearchPattern()

    // Fetch current Workspace Path from VS Code
    this.workspacePath = util.getWorkspace(context)

    // Default Tree View data
    this.treeViewData = []

    // Do initial load of data using cache
    this.refresh(true)
  }

  /**
   * Generate VS Code Tree View Data
   * @param {Object} list Array of Todo
   * @returns Object
   */
  generateTree(list) {
    // Collect Tree Data
    const treeData = []

    // TODO: Do something with `list`
    console.log(list)

    return treeData
  }

  /**
   * Get Search Pattern
   * @returns {Object} RegEx Search Pattern
   */
  getSearchPattern() {
    // Get Search Pattern
    const searchPattern = vscode.workspace.getConfiguration().get('extension.devTodoList.pattern')

    // Debug Search Pattern
    util.logger(localize('debug.logger.pattern', searchPattern))

    return searchPattern
  }

  /**
   *
   * @returns
   */
  getDevTodoList() {
    // TODO: Make this actually search files using `extension.devTodoList.pattern`
    return []
  }

  /**
   * Refresh Cartridge Tree
   */
  refresh(useCache) {
    // Show Loading Indicator Until Loaded
    vscode.window.withProgress(
      {
        location: { viewId: 'devTodoListView' },
      },
      () =>
        new Promise((resolve) => {
          if (!useCache) {
            // Clear Cache
            this.cachedDevTodoList.flush()
          }

          // Fetch Files from Workspace
          this.getDevTodoList().then((list) => {
            // Update Tree View Data
            this.treeViewData = this.generateTree(list)

            // Let VS Code know we have updated data
            vscode.commands.executeCommand('extension.devTodoList.updated', this.treeViewData)

            // Stop Loading Indicator
            resolve()
          })
        })
    )
  }
}

module.exports = DevTodoList
