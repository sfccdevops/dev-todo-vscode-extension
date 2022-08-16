'use strict'

const { Node, Block } = require('./Node')

/**
 * Code Comment
 *
 * This Class borrows code from Open Source Project:
 * @link https://github.com/jonschlinkert/strip-comments
 */
class CodeComment {
    /**
     * Initialize with RegEx Language Patterns
     */
    constructor() {
        // Base RegEx Patters
        this.ESCAPED_CHAR_REGEX = new RegExp('^\\.')
        this.QUOTED_STRING_REGEX = new RegExp('^([\'"`])((?:\\\x01|[^\x01])+?)(\x01)')
        this.NEWLINE_REGEX = new RegExp('^\r*\n')

        // Comments that start with `--`
        this.LINE_COMMENT_TWO_DASHES = new RegExp('^--.*')

        // Comments that start with `;;`
        this.LINE_COMMENT_TWO_SEMICOLONS = new RegExp('^;;.*')

        // Comments that start with `//` or `//!`
        this.LINE_COMMENT_TWO_SLASHES = new RegExp('^\\/\\/(!?).*')

        // Comments that start with `#`
        this.LINE_COMMENT_HASH = new RegExp('^#.*')

        // Comments that start with `%`
        this.LINE_COMMENT_PERCENT = new RegExp('^%.*')

        // A lot of programming language use comments like JavaScript
        this.BASE_C = {
            BLOCK_OPEN_REGEX: new RegExp('^\\/\\*\\*[^"]?(!?)[^"]'),
            BLOCK_CLOSE_REGEX: new RegExp('^\\*\\/(\\n?)'),
            LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
        }

        // Define Patterns to Detect Comments in Specific Languages
        this.languages = {
            ada: { LINE_REGEX: this.LINE_COMMENT_TWO_DASH },
            apl: { LINE_REGEX: new RegExp('^⍝.*') },
            applescript: {
                LINE_REGEX: this.LINE_COMMENT_TWO_DASH,
                BLOCK_OPEN_REGEX: new RegExp('^\\(\\*'),
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\)'),
            },
            bat: {
                LINE_REGEX: new RegExp('^REM.*'),
            },
            bibtex: {
                LINE_REGEX: this.LINE_COMMENT_PERCENT,
            },
            c: this.BASE_C,
            clojure: {
                LINE_REGEX: this.LINE_COMMENT_TWO_SEMICOLONS,
            },
            coffeescript: {
                BLOCK_OPEN_REGEX: new RegExp('^###'),
                BLOCK_CLOSE_REGEX: new RegExp('^###'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            cpp: this.BASE_C,
            csharp: {
                LINE_REGEX: new RegExp('^\\/\\/.*/'),
            },
            css: {
                BLOCK_OPEN_REGEX: new RegExp('^\\/\\*\\*[^"]?(!?)[^"]'),
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\/(\\n?)'),
            },
            cuda: {
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            dart: {
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            dockerfile: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            dwscript: this.BASE_C,
            fsharp: {
                LINE_REGEX: new RegExp('^\\/\\/\\/.*'),
            },
            go: this.BASE_C,
            groovy: this.BASE_C,
            handlebars: {
                BLOCK_OPEN_REGEX: new RegExp('^{{!'),
                BLOCK_CLOSE_REGEX: new RegExp('^}}'),
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            haskell: {
                BLOCK_OPEN_REGEX: new RegExp('^\\{-'),
                BLOCK_CLOSE_REGEX: new RegExp('^-\\}'),
                LINE_REGEX: this.LINE_COMMENT_TWO_DASH,
            },
            hlsl: this.BASE_C,
            html: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*\x3C!--(?!-?>)'),
                BLOCK_CLOSE_REGEX: new RegExp('^(?<!(?:<!-))-->'),
            },
            ignore: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            ini: {
                LINE_REGEX: new RegExp('^[;#].*'),
            },
            isml: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*<iscomment>'),
                BLOCK_CLOSE_REGEX: new RegExp('^</iscomment>'),
            },
            jade: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*\x3C!--(?!-?>)'),
                BLOCK_CLOSE_REGEX: new RegExp('^(?<!(?:<!-))-->'),
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            java: this.BASE_C,
            javascript: this.BASE_C,
            javascriptreact: this.BASE_C,
            jsonc: this.BASE_C,
            julia: {
                BLOCK_OPEN_REGEX: new RegExp('^#='),
                BLOCK_CLOSE_REGEX: new RegExp('^=#'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            jupyter: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            latex: {
                LINE_REGEX: this.LINE_COMMENT_PERCENT,
            },
            less: {
                BLOCK_OPEN_REGEX: new RegExp('^\\/\\*\\*[^"]?(!?)[^"]'),
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\/(\\n?)'),
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            lua: {
                BLOCK_OPEN_REGEX: new RegExp('^--\\[\\['),
                BLOCK_CLOSE_REGEX: new RegExp('^\\]\\]'),
                LINE_REGEX: this.LINE_COMMENT_TWO_DASH,
            },
            makefile: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            markdown: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*\x3C!--(?!-?>)'),
                BLOCK_CLOSE_REGEX: new RegExp('^(?<!(?:<!-))-->'),
            },
            matlab: {
                BLOCK_OPEN_REGEX: new RegExp('^%{'),
                BLOCK_CLOSE_REGEX: new RegExp('^%}'),
                LINE_REGEX: this.LINE_COMMENT_PERCENT,
            },
            objectivec: this.BASE_C,
            ocaml: this.BASE_C,
            pascal: {
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\)'),
                BLOCK_OPEN_REGEX: new RegExp('^\\(\\*'),
                LINE_REGEX: this.LINE_COMMENT_TWO_DASH,
            },
            perl: {
                BLOCK_OPEN_REGEX: new RegExp('^=begin'),
                BLOCK_CLOSE_REGEX: new RegExp('^=end'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            perl6: {
                BLOCK_OPEN_REGEX: new RegExp('^=begin'),
                BLOCK_CLOSE_REGEX: new RegExp('^=end'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            php: {
                BLOCK_OPEN_REGEX: new RegExp('^\\/\\*\\*?(!?)'),
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\/(\\n?)'),
                LINE_REGEX: new RegExp('^(#|\\/\\/).*?(?=\\?>|\\n)'),
            },
            powershell: {
                BLOCK_OPEN_REGEX: new RegExp('^<#'),
                BLOCK_CLOSE_REGEX: new RegExp('^#>'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            properties: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            python: {
                BLOCK_OPEN_REGEX: new RegExp('^"""'),
                BLOCK_CLOSE_REGEX: new RegExp('^"""'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            r: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            razor: this.BASE_C,
            ruby: {
                BLOCK_OPEN_REGEX: new RegExp('^=begin'),
                BLOCK_CLOSE_REGEX: new RegExp('^=end'),
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            rust: {
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            sass: {
                BLOCK_OPEN_REGEX: new RegExp('^\\/\\*\\*[^"]?(!?)[^"]'),
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\/(\\n?)'),
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            shaderlab: {
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            shellscript: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
            sql: {
                BLOCK_OPEN_REGEX: new RegExp('^\\/\\*\\*[^"]?(!?)[^"]'),
                BLOCK_CLOSE_REGEX: new RegExp('^\\*\\/(\\n?)'),
                LINE_REGEX: this.LINE_COMMENT_TWO_DASH,
            },
            swift: this.BASE_C,
            typescript: this.BASE_C,
            vb: {
                LINE_REGEX: new RegExp("^'.*"),
            },
            vue: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*\x3C!--(?!-?>)'),
                BLOCK_CLOSE_REGEX: new RegExp('^(?<!(?:<!-))-->'),
                LINE_REGEX: this.LINE_COMMENT_TWO_SLASHES,
            },
            xml: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*\x3C!--(?!-?>)'),
                BLOCK_CLOSE_REGEX: new RegExp('^(?<!(?:<!-))-->'),
            },
            xsl: {
                BLOCK_OPEN_REGEX: new RegExp('^\\n*<xsl:comment>'),
                BLOCK_CLOSE_REGEX: new RegExp('^</xsl:comment>'),
            },
            yaml: {
                LINE_REGEX: this.LINE_COMMENT_HASH,
            },
        }
    }

    findAll(input, options = {}) {
        if (typeof input !== 'string') {
            throw new TypeError('Expected input to be a string')
        }

        const commentBlocks = new Block({ type: 'root', nodes: [] })
        const stack = [commentBlocks]
        const name = (options.language || 'javascript').toLowerCase()
        const lang = this.languages[name]

        if (typeof lang === 'undefined') {
            throw new Error(`Language "${name}" is not supported`)
        }

        const { LINE_REGEX, BLOCK_OPEN_REGEX, BLOCK_CLOSE_REGEX } = lang

        let block = commentBlocks
        let remaining = input
        let token
        let prev

        const source = [BLOCK_OPEN_REGEX, BLOCK_CLOSE_REGEX].filter(Boolean)
        let tripleQuotes = false

        if (source.every((regex) => regex.source === '^"""')) {
            tripleQuotes = true
        }

        /**
         * Helpers
         */

        const consume = (value = remaining[0] || '') => {
            remaining = remaining.slice(value.length)
            return value
        }

        const scan = (regex, type = 'text') => {
            const match = regex.exec(remaining)
            if (match) {
                consume(match[0])
                return { type, value: match[0], match }
            }
        }

        const push = (node) => {
            if (prev && prev.type === 'text' && node.type === 'text') {
                prev.value += node.value
                return
            }
            block.push(node)
            if (node.nodes) {
                stack.push(node)
                block = node
            }
            prev = node
        }

        const pop = () => {
            if (block.type === 'root') {
                throw new SyntaxError('Unclosed block comment')
            }
            stack.pop()
            block = stack[stack.length - 1]
        }

        /**
         * Parse input string
         */

        while (remaining !== '') {
            // escaped characters
            if ((token = scan(this.ESCAPED_CHAR_REGEX, 'text'))) {
                push(new Node(token))
                continue
            }

            // quoted strings
            if (block.type !== 'block' && (!prev || !/\w$/.test(prev.value)) && !(tripleQuotes && remaining.startsWith('"""'))) {
                if ((token = scan(this.QUOTED_STRING_REGEX, 'text'))) {
                    push(new Node(token))
                    continue
                }
            }

            // newlines
            if ((token = scan(this.NEWLINE_REGEX, 'newline'))) {
                push(new Node(token))
                continue
            }

            // block comment open
            if (BLOCK_OPEN_REGEX && options.block && !(tripleQuotes && block.type === 'block')) {
                if ((token = scan(BLOCK_OPEN_REGEX, 'open'))) {
                    if (token.match.length > 1) {
                        token.newline = token.match.join('')
                    }
                    push(new Block({ type: 'block' }))
                    push(new Node(token))
                    continue
                }
            }

            // block comment close
            if (BLOCK_CLOSE_REGEX && block.type === 'block' && options.block) {
                if ((token = scan(BLOCK_CLOSE_REGEX, 'close'))) {
                    if (token.match.length > 1) {
                        token.newline = token.match.join('')
                    }
                    push(new Node(token))
                    pop()
                    continue
                }
            }

            // line comment
            if (LINE_REGEX && block.type !== 'block' && options.line) {
                if ((token = scan(LINE_REGEX, 'line'))) {
                    push(new Node(token))
                    continue
                }
            }

            // Plain text (skip "C" since some languages use "C" to start comments)
            if ((token = scan(/^[a-zABD-Z0-9\t ]+/, 'text'))) {
                push(new Node(token))
                continue
            }

            push(new Node({ type: 'text', value: consume(remaining[0]) }))
        }

        const cleanComment = (comment) => {
            return comment.replace(/^[^0-9a-zA-Z:,@]+/, '').trim()
        }

        // TODO: Don't loop through the same file more than once
        const getLineNumber = (text, isBlock) => {
            let lineNum = 0
            let matches = 0
            let comment = isBlock ? text.split(/\r?\n/) : [text]

            // Break apart file line by line
            input.split(/\r?\n/).every((line) => {
                if (matches === 0) {
                    lineNum += 1
                }

                if (line.includes(comment[matches])) {
                    matches += 1

                    if (matches === comment.length) {
                        return false
                    }
                } else {
                    matches = 0
                }

                return true
            })

            return lineNum
        }

        const filter = (comments) => {
            const clean = []
            comments.forEach((comment) => {
                if (comment.type === 'line' && comment.value && comment.value.trim().length > 1) {
                    const lineComment = cleanComment(comment.value)

                    if (lineComment && lineComment.length > 0) {
                        clean.push({
                            line: lineComment,
                            lineNo: getLineNumber(lineComment),
                        })
                    }
                }

                if (comment.type === 'block') {
                    comment.nodes.forEach((block) => {
                        if (block.type === 'text' && block.value && block.value.trim().length > 1) {
                            const blockComment = cleanComment(block.value)

                            if (blockComment && blockComment.length > 0) {
                                clean.push({
                                    line: blockComment,
                                    lineNo: getLineNumber(blockComment, true),
                                })
                            }
                        }
                    })
                }
            })

            return clean
        }

        return filter([...commentBlocks.nodes])
    }
}

module.exports = CodeComment
