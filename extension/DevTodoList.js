'use strict'

const fg = require('fast-glob')
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

        // Get VS Code Configuration
        this.configuration = vscode.workspace.getConfiguration()

        // Create Cache Instances
        this.cachedDevTodoList = new Cache(context, 'devTodoList')

        // Establish VS Code Context
        this.context = context

        // Fetch Todo Keywords from Configuration
        this.keywords = this.getKeywords()

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
        return new Promise((resolve) => {
            console.log(list)
            // Collect Tree Data
            const treeData = []

            // Extract Data
            const { gitUserName, toDos } = list
            const labels = toDos ? Object.keys(toDos) : []

            // Sort Keys
            labels.sort()

            // Process List
            labels.forEach((name) => {
                const total = toDos[name].total
                const tooltip = total === 1 ? localize('panel.devToDoList.located.singular', total, name) : localize('panel.devToDoList.located.plural', total, name)

                // TODO: Create File Tree for Children
                // TODO: Check `gitUserName` against file `author`

                // Push Item to Tree View
                treeData.push({
                    name,
                    contextValue: 'folder',
                    children: [], // cartridges[name].tree,
                    tooltip: tooltip,
                    description: `( ${total} )`,
                    command: null,
                })
            })

            console.log(treeData)

            return resolve(treeData)
        })
    }

    /**
     * Generate List of File and Folder Exclusions
     * @returns Object
     */
    getExcludeList() {
        // Start list of File Excludes
        let excludes = [
            // Binary Extensions ( from `binary-extensions` npm package )
            '**/*.{3dm,3ds,3g2,3gp,7z,a,aac,adp,ai,aif,aiff,alz,ape,apk,appimage,ar,arj,asf,au,avi,bak,baml,bh,bin,bk,bmp,btif,bz2,bzip2,cab,caf,cgm,class,cmx,cpio,cr2,cur,dat,dcm,deb,dex,djvu,dll,dmg,dng,doc,docm,docx,dot,dotm,dra,DS_Store,dsk,dts,dtshd,dvb,dwg,dxf,ecelp4800,ecelp7470,ecelp9600,egg,eol,eot,epub,exe,f4v,fbs,fh,fla,flac,flatpak,fli,flv,fpx,fst,fvt,g3,gh,gif,graffle,gz,gzip,h261,h263,h264,icns,ico,ief,img,ipa,iso,jar,jpeg,jpg,jpgv,jpm,jxr,key,ktx,lha,lib,lvp,lz,lzh,lzma,lzo,m3u,m4a,m4v,mar,mdi,mht,mid,midi,mj2,mka,mkv,mmr,mng,mobi,mov,movie,mp3,mp4,mp4a,mpeg,mpg,mpga,mxu,nef,npx,numbers,nupkg,o,odp,ods,odt,oga,ogg,ogv,otf,ott,pages,pbm,pcx,pdb,pdf,pea,pgm,pic,png,pnm,pot,potm,potx,ppa,ppam,ppm,pps,ppsm,ppsx,ppt,pptm,pptx,psd,pya,pyc,pyo,pyv,qt,rar,ras,raw,resources,rgb,rip,rlc,rmf,rmvb,rpm,rtf,rz,s3m,s7z,scpt,sgi,shar,snap,sil,sketch,slk,smv,snk,so,stl,suo,sub,swf,tar,tbz,tbz2,tga,tgz,thmx,tif,tiff,tlz,ttc,ttf,txz,udf,uvh,uvi,uvm,uvp,uvs,uvu,viv,vob,war,wav,wax,wbmp,wdp,weba,webm,webp,whl,wim,wm,wma,wmv,wmx,woff,woff2,wrm,wvx,xbm,xif,xla,xlam,xls,xlsb,xlsm,xlsx,xlt,xltm,xltx,xm,xmind,xpi,xpm,xwd,xz,z,zip,zipx}',

            // Files without comments
            '**/*.{json,md,markdown,txt}',
        ]

        // Get Extension Exclude List
        const extensionExclude = this.configuration.get('extension.devTodoList.exclude')

        // Get Workspace Files Exclude List
        const workspaceFilesExclude = this.configuration.get('files.exclude')

        // Get Workspace Search Exclude List
        const workspaceSearchExclude = this.configuration.get('search.exclude')

        // Add our Extensions Ignore Items
        if (Array.isArray(extensionExclude)) {
            excludes = excludes.concat(extensionExclude)
        }

        // Check for Workspace File Excludes
        if (workspaceFilesExclude && Object.keys(workspaceFilesExclude).length > 0) {
            // Loop through Exclude List
            for (const [key, enabled] of Object.entries(workspaceFilesExclude)) {
                // Make sure this is not already in our list, and that the setting is enabled in VS Code
                if (excludes.indexOf(key) === -1 && Object.prototype.hasOwnProperty.call(workspaceFilesExclude, key) && enabled) {
                    excludes.push(key)
                }
            }
        }

        // Check for Workspace Search Excludes
        if (workspaceSearchExclude && Object.keys(workspaceSearchExclude).length > 0) {
            // Loop through Exclude List
            for (const [key, enabled] of Object.entries(workspaceSearchExclude)) {
                // Make sure this is not already in our list, and that the setting is enabled in VS Code
                if (excludes.indexOf(key) === -1 && Object.prototype.hasOwnProperty.call(workspaceSearchExclude, key) && enabled) {
                    excludes.push(key)
                }
            }
        }

        // Return Sorted List of Excludes
        return excludes.sort()
    }

    /**
     * Get Todo Keywords
     * @returns {Object} Array of Todo Keywords
     */
    getKeywords() {
        // Get Search Pattern
        const keywords = vscode.workspace.getConfiguration().get('extension.devTodoList.keywords')

        // Debug Search Pattern
        util.logger(localize('debug.logger.keywords', keywords))

        return keywords
    }

    /**
     *
     * @returns
     */
    getDevTodoList() {
        return new Promise((resolve) => {
            // Check if we have cache for Workspace Files
            if (this.cachedDevTodoList.has('searchResults')) {
                // Debug Cache Status
                util.logger(localize('debug.logger.usingCache'))

                // We have a cached file list
                return resolve(this.cachedDevTodoList.get('searchResults'))
            } else {
                // Debug Cache Status
                util.logger(localize('debug.logger.noCache'))

                // Get Exclusion List
                const excludeList = this.getExcludeList()

                // Get list of Files from Workspace
                const fileList = fg.sync('**', {
                    absolute: true,
                    cwd: this.workspacePath,
                    dot: false,
                    ignore: excludeList,
                })

                // Sort Files
                fileList.sort()

                // TODO: When file changed, only re-index that single file and update the cache with the results ( vs re-indexing everything )
                const searchResults = Promise.resolve(util.findTodoComments(fileList, this.keywords.join('|'), this.workspacePath))

                searchResults.then((data) => {
                    this.cachedDevTodoList.set('searchResults', data)
                    return resolve(data)
                })
            }
        })
    }

    /**
     * Refresh Cartridge Tree
     */
    refresh(useCache) {
        // Send Notification that Process is Staring
        if (!useCache) {
            vscode.window.showInformationMessage(localize('dialog.info.refreshStarted'))
        }

        // Show Loading Indicator Until Loaded
        vscode.window.withProgress(
            {
                location: { viewId: 'devTodoListView' },
            },
            () =>
                new Promise((resolve, reject) => {
                    if (!useCache) {
                        // Clear Cache
                        this.cachedDevTodoList.flush()

                        // Get VS Code Configuration
                        this.configuration = vscode.workspace.getConfiguration()
                    }

                    // Fetch Files from Workspace
                    this.getDevTodoList()
                        .then((list) => {
                            // Update Tree View Data
                            this.generateTree(list).then((data) => {
                                // Update Tree Data
                                this.treeViewData = data

                                // Send Notification that Process is Complete
                                if (!useCache) {
                                    vscode.window.showInformationMessage(localize('dialog.info.refreshComplete'))
                                }

                                // Let VS Code know we have updated data
                                vscode.commands.executeCommand('extension.devTodoList.updated', this.treeViewData)

                                // Stop Loading Indicator
                                resolve()
                            })
                        })
                        .catch((err) => {
                            util.logger(localize('debug.logger.error', 'DevTodoList.refresh:getDevTodoList', err.toString()), 'error')
                            reject(err)
                        })
                })
        )
    }
}

module.exports = DevTodoList
