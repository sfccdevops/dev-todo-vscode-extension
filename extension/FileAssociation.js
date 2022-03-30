'use strict'

const path = require('path')

/**
 * File Association
 */
class FileAssociation {
    constructor() {
        /**
         * File Types that Support Code Comments
         * VS Code File Types & Extensions pulled from Open Source ( https://github.com/microsoft/vscode/tree/main/extensions )
         */
        this.fileTypes = {
            ada: ['.adb', '.ads'],
            apl: ['.apl'],
            applescript: ['.scpt'],
            bat: ['.bat', '.btm', '.cmd'],
            bibtex: ['.bib'],
            c: ['.c', '.i'],
            clojure: ['.clj', '.cljc', '.cljs', '.cljx', '.clojure', '.edn'],
            coffeescript: ['.coffee', '.cson', '.iced'],
            cpp: ['.c++', '.cc', '.cpp', '.cxx', '.h.in', '.h', '.h++', '.hh', '.hpp.in', '.hpp', '.hxx', '.ii', '.inl', '.ino', '.ipp', '.ixx', '.tpp', '.txx'],
            csharp: ['.cake', '.cs', '.csx'],
            css: ['.css'],
            cuda: ['.cu', '.cuh'],
            dart: ['.dart'],
            dockerfile: ['.containerfile', '.dockerfile', 'Containerfile', 'Dockerfile'],
            dwscript: ['.ds'],
            fsharp: ['.fs', '.fsi', '.fsscript', '.fsx'],
            go: ['.go'],
            groovy: ['.gradle', '.groovy', '.gvy', '.jenkinsfile', '.nf'],
            handlebars: ['.handlebars', '.hbs', '.hjs'],
            haskell: ['.hs'],
            hlsl: ['.cginc', '.compute', '.fx', '.fxh', '.hlsl', '.hlsli', '.psh', '.vsh'],
            html: ['.asp', '.aspx', '.ejs', '.htm', '.html', '.jshtm', '.jsp', '.mdoc', '.rhtml', '.shtml', '.volt', '.xht', '.xhtml'],
            ignore: ['.eslintignore', '.gitignore', '.npmignore', '.prettierignore', '.vscodeignore'],
            ini: ['.ini'],
            isml: ['.isml'],
            jade: ['.jade', '.pug'],
            java: ['.jav', '.java'],
            javascript: ['.cjs', '.es6', '.js', '.mjs', '.pac'],
            javascriptreact: ['.jsx'],
            jsonc: ['.babelrc.json', '.babelrc', '.ember-cli', '.eslintrc.json', '.eslintrc', '.hintrc', '.jsfmtrc', '.jshintrc', '.jsonc', '.swcrc', 'babel.config.json', 'jsconfig.json', 'tsconfig.json'],
            julia: ['.jl'],
            jupyter: ['.ipynb'],
            latex: ['.ctx', '.ltx', '.tex', '.bbx', '.cbx', '.cls', '.sty'],
            less: ['.less'],
            lua: ['.lua'],
            makefile: ['.mak', '.mk', 'GNUmakefile', 'makefile', 'Makefile', 'OCamlMakefile'],
            markdown: ['.markdn', '.markdown', '.md', '.mdown', '.mdtext', '.mdtxt', '.mdwn', '.mkd', '.workbook'],
            matlab: ['.mat'],
            objectivec: ['.m', '.mm'],
            ocaml: ['.ml', '.mli'],
            pascal: ['.pp', '.pas', '.inc'],
            perl: ['.pl', '.PL', '.pm', '.pod', '.psgi', '.t'],
            perl6: ['.nqp', '.p6', '.pl6', '.pm6'],
            php: ['.ctp', '.php', '.php4', '.php5', '.phtml'],
            powershell: ['.ps1', '.psd1', '.psm1', '.psrc', '.pssc'],
            properties: ['.cfg', '.conf', '.directory', '.editorconfig', '.gitattributes', '.gitconfig', '.gitmodules', '.npmrc', '.properties'],
            python: ['.cpy', '.gyp', '.gypi', '.ipy', '.py', '.pyi', '.pyt', '.pyw', '.rpy', 'SConscript', 'SConstruct', 'Snakefile'],
            r: ['.r', '.rhistory', '.rprofile', '.rt'],
            razor: ['.cshtml'],
            ruby: ['.erb', '.gemspec', '.podspec', '.rake', '.rb', '.rbi', '.rbx', '.rjs', '.ru', 'appfile', 'appraisals', 'berksfile.lock', 'berksfile', 'brewfile', 'capfile', 'cheffile', 'dangerfile', 'deliverfile', 'fastfile', 'gemfile', 'guardfile', 'gymfile', 'hobofile', 'matchfile', 'podfile', 'puppetfile', 'rakefile', 'rantfile', 'scanfile', 'snapfile', 'thorfile', 'vagrantfile'],
            rust: ['.rs'],
            sass: ['.sass', '.scss'],
            shaderlab: ['.shader'],
            shellscript: ['.bash_aliases', '.bash_login', '.bash_logout', '.bash_profile', '.bash', '.bashrc', '.csh', '.cshrc', '.ebuild', '.envrc', '.hushlogin', '.ksh', '.profile', '.sh', '.tcshrc', '.xprofile', '.xsession', '.Xsession', '.xsessionrc', '.yash_profile', '.yashrc', '.zlogin', '.zlogout', '.zprofile', '.zsh-theme', '.zsh', '.zshenv', '.zshrc', 'APKBUILD', 'bashrc_Apple_Terminal', 'PKGBUILD', 'zlogin', 'zlogout', 'zprofile', 'zshenv', 'zshrc_Apple_Terminal', 'zshrc'],
            sql: ['.dsql', '.sql'],
            swift: ['.swift'],
            typescript: ['.cts', '.mts', '.ts', '.tsx'],
            vb: ['.bas', '.brs', '.vb', '.vba', '.vbs'],
            vue: ['.vue'],
            xml: [
                '.ascx',
                '.atom',
                '.axaml',
                '.axml',
                '.bpmn',
                '.cpt',
                '.csl',
                '.csproj.user',
                '.csproj',
                '.dita',
                '.ditamap',
                '.dtd',
                '.dtml',
                '.ent',
                '.fsproj',
                '.fxml',
                '.iml',
                '.jmx',
                '.launch',
                '.menu',
                '.mod',
                '.mxml',
                '.nuspec',
                '.opml',
                '.owl',
                '.proj',
                '.props',
                '.pt',
                '.publishsettings',
                '.pubxml.user',
                '.pubxml',
                '.rbxlx',
                '.rbxmx',
                '.rdf',
                '.rng',
                '.rss',
                '.shproj',
                '.storyboard',
                '.svg',
                '.targets',
                '.tld',
                '.tmx',
                '.vbproj.user',
                '.vbproj',
                '.vcxproj.filters',
                '.vcxproj',
                '.wsdl',
                '.wxi',
                '.wxl',
                '.wxs',
                '.xaml',
                '.xbl',
                '.xib',
                '.xlf',
                '.xliff',
                '.xml',
                '.xoml',
                '.xpdl',
                '.xsd',
                '.xul',
            ],
            xsl: ['.xsl', '.xslt'],
            yaml: ['.cff', '.eyaml', '.eyml', '.yaml', '.yml'],
        }

        /**
         * Mapped Extensions ( this is generated on request to prevent duplicate lookups )
         */
        this.mapped = { yml: 'yaml' }
    }

    /**
     * Get File Type
     * @param {String} filePath Absolute Path to File
     */
    getFileType(filePath) {
        const fileName = filePath.substring(filePath.lastIndexOf(path.sep) + 1)
        const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)

        // Check if we already mapped this extension to its file type
        if (Object.prototype.hasOwnProperty.call(this.mapped, fileExt)) {
            return this.mapped[fileExt]
        }

        // Find File Type by Extension
        let fileType
        Object.keys(this.fileTypes).reduce((types, key) => {
            return types.concat(
                this.fileTypes[key].filter((ext) => {
                    const match = fileName.endsWith(ext) || ext.endsWith(fileExt)

                    if (match) {
                        fileType = key
                    }

                    return match
                })
            )
        }, [])

        // Update Mapped Indexing
        this.mapped[fileExt] = fileType

        return fileType
    }
}

module.exports = FileAssociation
