'use strict'

const fs = require('fs')
const path = require('path')
const vscode = require('vscode')

const { exec } = require('child_process')
const { init, localize } = require('vscode-nls-i18n')

const CodeComment = require('./CodeComment')
const FileAssociation = require('./FileAssociation')

// Create custom Output Channel to Log Helpful Messages
const output = vscode.window.createOutputChannel('Developer Todo List')

/**
 * Fetch Git Info
 * @param {String} command Bash Command to Fetch Git Info
 * @returns {String} Git Info
 */
const _fetchGitInfo = async (command, workspacePath) => {
    const output = new Promise((resolve, reject) => {
        // Make sure command starts with either `git config` or `git blame`
        if (typeof command !== 'string' || (command !== 'git config --get user.name' && !command.startsWith('git blame --line-porcelain -L '))) {
            return reject('Permission Denied')
        }

        // Run Bash Command to fetch Git Info
        exec(command, { cwd: workspacePath }, (error, stdout, stderr) => {
            // We are currently only using this to fetch git info that is safe to ignore
            if (error || stderr) {
                return resolve(null)
            }

            // If we got an output, let's return it
            return resolve(stdout)
        })
    })

    return output
}

/**
 * Search File List
 * @param {Object} fileList Array of Files
 * @param {Object} results Current Results of Search
 * @param {Object} keywords RegExp Pattern for Todo Keywords
 * @returns {Object} Search Result Collection
 */
const _searchList = async (fileList, results, keywords, workspacePath) => {
    const association = new FileAssociation()
    const regex = new RegExp(`^(${keywords}):?\\s(.*)`, 'g')

    fileList.forEach(async (file) => {
        const language = association.getFileType(file)

        if (language && language.length > 0) {
            const comment = new CodeComment()

            // TODO: See if there is a faster way to open the file
            const data = fs.readFileSync(file, {
                encoding: 'utf8',
                flag: 'r',
            })

            if (data) {
                // Check entire file for line comments and comment blocks
                const comments = comment.findAll(data, { block: true, line: true, first: true, language: language })

                // Don't bother continuing if there are no comments
                if (!comments || comments.length === 0) {
                    return
                }

                // Loop through results for keyword matches
                comments.forEach(async (obj) => {
                    // Get Data from Comment Object
                    const { line, lineNo } = obj

                    // Prep the line and check if this is a todo comment
                    const clean = line.trim()
                    const match = [...clean.matchAll(regex)] || []

                    // Check if we have a match
                    if (match && match[0] && match[0].length > 0) {
                        // Map results from search
                        const keyword = match[0][1] ? match[0][1].trim().toUpperCase() : null
                        const message = match[0][2] ? match[0][2].replace(/\W+$/, '').trim() : null

                        // Make sure we have a comment
                        if (keyword && message && message.length > 0 && keywords.indexOf(keyword) > -1) {
                            // Start Keyword List if New
                            if (results && keyword && !Object.prototype.hasOwnProperty.call(results, keyword)) {
                                results[keyword] = {
                                    total: 1,
                                    files: [],
                                }
                            } else {
                                results[keyword].total++
                            }

                            // Start File List if New
                            const filePath = path.relative(workspacePath, file)

                            if (results && keyword && results[keyword] && results[keyword]['files'] && !Object.prototype.hasOwnProperty.call(results[keyword]['files'], filePath)) {
                                results[keyword]['files'][filePath] = []
                            }

                            // Fetch Line Number and Git Author data using line below
                            let author = await _fetchGitInfo(`git blame --line-porcelain -L ${lineNo},+1 ${filePath} --porcelain | sed -n "s/^author //p"`, workspacePath)
                            author = author.trim()

                            results[keyword]['files'][filePath].push({
                                author,
                                lineNo,
                                message,
                            })
                        } else {
                            return
                        }
                    } else {
                        return
                    }
                })
            }
        }
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
const findTodoComments = async (fileList, keywords, workspacePath) => {
    const gitUserName = await _fetchGitInfo(`git config --get user.name`, workspacePath)
    const initialResult = {}
    const toDos = await _searchList(fileList, initialResult, keywords, workspacePath)

    return {
        gitUserName: gitUserName ? gitUserName.replace(/(\r\n|\n|\r)/gm, '') : null,
        toDos: toDos,
    }
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
        } else if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
            // There is more than one Workspace, so let's grab the active one
            if (vscode.window.activeTextEditor) {
                // Since there is a file active, let's find the workspace from that file
                root = vscode.workspace.workspaceFolders.find((wsFolder) => {
                    const relative = path.relative(wsFolder.uri.fsPath, vscode.window.activeTextEditor.document.uri.path)
                    return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
                })

                // The file that is active does not belong to any of the workspace folders, so let's use the first workspace
                if (!root) {
                    root = vscode.workspace.workspaceFolders[0]
                }

                workspace = root && root.uri ? root.uri.fsPath : null
            } else {
                // No file was open, so just grab the first available workspace
                root = vscode.workspace.workspaceFolders[0]
                workspace = root && root.uri ? root.uri.fsPath : null
            }
        } else if (context && vscode.workspace) {
            // Something else is going on, let's see if we can still figure it out
            try {
                root = vscode.workspace.getWorkspaceFolder(context)
                workspace = root && root.uri ? root.uri.fsPath : null
            } catch (err) {
                logger(err, 'error')
            }
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
    logger,
}
