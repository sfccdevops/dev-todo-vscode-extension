'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const vscode = require('vscode')

const { init, localize } = require('vscode-nls-i18n')

// Create custom Output Channel to Log Helpful Messages
const output = vscode.window.createOutputChannel('Developer Todo List')

/**
 * Search File
 * @param {String} filePath  Absolute URL for File
 * @param {Object} results Current Results of Search
 * @param {Object} regex RegExp Pattern for Todo Keywords
 * @returns {Object} File Search Results
 */
const _searchFile = async (filePath, results, regex) => {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filePath),
    console: false
  })

  let found = 0
  let lineNo = 1

  // Read line by line
  for await (const line of readInterface) {
    const match = [...line.matchAll(regex)] || []
    if (match && match[0] && match[0].length > 0) {
      // Map results from search
      const input = match[0].input ? match[0].input.trim() : null
      const source = match[0][0] ? match[0][0].trim() : null
      const keyword = match[0][1] ? match[0][1].trim().toUpperCase() : null

      // We're going to be doing so cleanup to the message if it is present
      let message = match[0][2] ? match[0][2].trim() : null

      // Before we dismiss this line of code, let's check if perhaps it should have been included
      if (!message && input.startsWith(source)) {
        message = input.replace(source, '')
      }

      // Sanity Check that we found a valid match and not a false positive
      if (keyword && message) {
        found++

        // Cleanup Message if Needed
        message = message.replace(/\*\/$/, '')
        message = message.replace(/-->$/, '')
        message = message.trim()

        // Start Keyword List if New
        if (results && keyword && !results.hasOwnProperty(keyword)) {
          results[keyword] = {
            'total': 0,
            'files': []
          }
        } else {
          results[keyword].total++
        }

        // Start File List if New
        if (results && keyword && results[keyword] && results[keyword]['files'] && !results[keyword]['files'].hasOwnProperty(filePath)) {
          results[keyword]['files'][filePath] = []
        }

        // TODO: See if we can figure out who authored this line from git
        results[keyword]['files'][filePath].push({
          line: lineNo,
          message: message
        })
      }
    }

    lineNo++
  }

  return results
}

/**
 * Search File List
 * @param {Object} fileList Array of Files
 * @param {Object} results Current Results of Search
 * @param {Object} regex RegExp Pattern for Todo Keywords
 * @returns {Object} Search Result Collection
 */
const _searchList = async (fileList, results, regex) => {
  fileList.forEach(async (file) => {
    await _searchFile(file, results, regex)
  })

  return results
}

/**
 * Log output to "Developer Todo List" Output Terminal
 * @param {String} message Debug Message
 * @param {String} type Debug Type
 */
const logger = (message, type) => {
  let icon = ''
  let newLine = type ? '\n' : ''

  // Convert message to String if it was not already
  if (typeof message !== 'string') {
    message = JSON.stringify(message)
  }

  // Prefix Logger Messages with Icons
  if (type === 'debug') {
    icon = '› '
  } else if (type === 'error') {
    icon = '✖ '
  } else if (type === 'success') {
    icon = '✔ '
  } else if (type === 'warn') {
    icon = '⚠ '
  }

  // Write Output to Terminal
  output.appendLine(`${newLine}${icon}${message}`)
}

/**
 * Find Todo Comments
 * @param {Object} fileList Array of Files
 * @param {String} keywords Todo Pattern Keywords
 * @returns
 */
const findTodoComments = async (fileList, keywords) => {
  const regex = new RegExp(`(?:<!-- *)?(?:#|// @|//|/\\*+|<!--|--|\\* @|\\{!|\\{\\{!--|\\{\\{!) *(${keywords})(?:\\s*\\([^)]+\\))?:?(?!\\w)(?: *-->| *\\*/| *!}| *--}}| *}}|(?= *(?:[^:]//|/\\*+|<!--|@|--|\\{!|\\{\\{!--|\\{\\{!))|((?: +[^\\n@]*?)(?= *(?:[^:]//|/\\*+|<!--|@|--(?!>)|\\{!|\\{\\{!--|\\{\\{!))|(?: +[^@\\n]+)?))`, 'gi')
  const initialResult = {}

  return await _searchList(fileList, initialResult, regex)
}

/**
 * Get Icon for Tree View
 * @param {String} type Tree Item Type
 * @param {Integer} overrideCount Use to Indicate Override
 * @returns {Object} Tree Item iconPath
 */
const getIcon = (type, overrideCount) => {
  return {
    light: path.join(__filename, '..', 'resources', 'light', `${type}${overrideCount && overrideCount > 0 ? '-active' : ''}.svg`),
    dark: path.join(__filename, '..', 'resources', 'dark', `${type}${overrideCount && overrideCount > 0 ? '-active' : ''}.svg`),
  }
}

/**
 * Get VS Code Workspace Base
 * @param {*} context
 * @returns
 */
const getWorkspace = (context) => {
  // Initialize Localization
  init(context.extensionPath)

  let root
  let workspace

  // Check for missing VS Code Workspace, if present, otherwise use context path
  if (context && !vscode.workspace && !vscode.workspace.workspaceFolders) {
    workspace = vscode.workspace.rootPath ? vscode.workspace.rootPath : path.dirname(context.fsPath)
  } else {
    // We have a Workspace, now let's figure out if it's single or multiroot
    if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
      // There was only one Workspace, so we can just use it
      root = vscode.workspace.workspaceFolders[0]
      workspace = root && root.uri ? root.uri.fsPath : null
    } else if (context && vscode.workspace) {
      // There is more than one, so let's use the provided resource to figure out our root
      root = vscode.workspace.getWorkspaceFolder(context)
      workspace = root && root.uri ? root.uri.fsPath : null
    }
  }

  // If we did not get Workspace, let the user know
  if (!workspace) {
    const message = localize('debug.logger.missingWorkspace')
    logger(message, 'error')
    vscode.window.showErrorMessage(`${localize('extension.title')}: ${message}`)
  }

  // Debug Cartridge Path
  logger(localize('debug.logger.workspace', workspace))

  return workspace
}

module.exports = {
  findTodoComments,
  getIcon,
  getWorkspace,
  logger
}
