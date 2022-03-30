'use strict'

const vscode = require('vscode')

/**
 * Dev Todo List Provider
 */
class DevTodoListProvider {
    /**
     * Dev Todo List Provider
     * @param {Object} treeData Array of Dev Todo List Tree Data
     */
    constructor(context) {
        // Establish VS Code Context
        this.context = context

        // Populate Tree with Data
        this.treeData = null

        // Create Custom Event Listener
        this._onDidChangeTreeData = new vscode.EventEmitter()
        this.onDidChangeTreeData = this._onDidChangeTreeData.event

        // TODO: We should probably give a developer a way to ignore comments contextually
    }

    /**
     * Get Children for Tree View
     * @param {Object} element Tree Item
     * @returns Tree Item
     */
    getChildren(element) {
        // Check if this tree element has children
        if (element) {
            // This has children, so let's render them
            return Promise.resolve(element.children)
        } else {
            // No children here, so we can just render what we have
            return Promise.resolve(this.treeData)
        }
    }

    /**
     * Get Tree View Node Element
     * @param {String} file File Path to Lookup
     * @returns
     */
    getElement(name) {
        return this.treeData.find((item) => {
            return item.name === name
        })
    }

    /**
     * Get Parent ( used for Tree View `reveal` method )
     * @param {Object} element
     * @returns
     */
    getParent(element) {
        return element.parent
    }

    /**
     * Get Item for VS Code Tree
     * @param {Object} item Date for Tree View Item
     * @returns {Object} TreeItem
     */
    getTreeItem(item) {
        // Check if this item has children to support collapse & expand
        const collapsibleState = item.children && item.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None

        // Create VS Code Tree Item
        const treeItem = new vscode.TreeItem(item.name, collapsibleState)

        // Add Custom Tree Item Data
        treeItem.command = item.command || null
        treeItem.description = item.description || null
        treeItem.iconPath = item.iconPath || null
        treeItem.resourceUri = item.resourceUri || null
        treeItem.tooltip = item.tooltip || null

        return treeItem
    }

    /**
     * Refresh Tree View Data
     * @param {Object} treeData Array of Dev Todo List Tree
     */
    refresh(treeData) {
        this.treeData = treeData
        this._onDidChangeTreeData.fire(undefined)
    }
}

module.exports = DevTodoListProvider
