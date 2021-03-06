'use strict'

/**
 * @class Cache
 * @desc A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.
 * @param {vscode.ExtensionContext} context - The Visual Studio Code extension context
 * @param {string} [namespace] - Optional namespace for cached items. Defaults to "cache"
 * @returns {Cache} The cache object
 */
const Cache = function (context, namespace) {
    if (!context) {
        return undefined
    }

    // ExtensionContext
    this.context = context

    // Namespace of the context's globalState
    this.namespace = namespace || 'cache'

    // Local cache object
    this.cache = this.context.globalState.get(this.namespace, {})
}

/**
 * @name Cache#set
 * @method
 * @desc Store an item in the cache, with optional expiration
 * @param {string} key - The unique key for the cached item
 * @param {any} value - The value to cache
 * @param {number} [expiration] - Optional expiration time in seconds
 * @returns {Promise} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.set = function (key, value, expiration) {
    // Parameter type checking
    if (typeof key !== 'string' || typeof value === 'undefined') {
        return new Promise((resolve) => {
            resolve(false)
        })
    }

    let obj = {
        value: value,
    }

    // Set expiration
    if (Number.isInteger(expiration)) {
        obj.expiration = now() + expiration
    }

    // Save to local cache object
    this.cache[key] = obj

    // Save to extension's globalState
    return this.context.globalState.update(this.namespace, this.cache)
}

/**
 * @name Cache#get
 * @desc Get an item from the cache, or the optional default value
 * @function
 * @param {string} key - The unique key for the cached item
 * @param {any} [defaultValue] - The optional default value to return if the cached item does not exist or is expired
 * @returns {any} Returns the cached value or optional defaultValue
 */
Cache.prototype.get = function (key, defaultValue) {
    // If doesn't exist
    if (typeof this.cache[key] === 'undefined') {
        // Return default value
        if (typeof defaultValue !== 'undefined') {
            return defaultValue
        } else {
            return undefined
        }
    } else {
        // Is item expired?
        if (this.isExpired(key)) {
            return undefined
        }
        // Otherwise return the value
        return this.cache[key].value
    }
}

/**
 * @name Cache#has
 * @desc Checks to see if unexpired item exists in the cache
 * @function
 * @param {string} key - The unique key for the cached item
 * @return {boolean}
 */
Cache.prototype.has = function (key) {
    if (typeof this.cache[key] === 'undefined') {
        return false
    } else {
        return this.isExpired(key) ? false : true
    }
}

/**
 * @name Cache#remove
 * @desc Removes an item from the cache
 * @function
 * @param {string} key - The unique key for the cached item
 * @returns {Thenable} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.remove = function (key) {
    // Does item exist?
    if (typeof this.cache[key] === 'undefined') {
        return new Promise((resolve) => {
            resolve(true)
        })
    }

    // Delete from local object
    delete this.cache[key]

    // Update the extension's globalState
    return this.context.globalState.update(this.namespace, this.cache)
}

/**
 * @name Cache#keys
 * @desc Get an array of all cached item keys
 * @function
 * @return {string[]}
 */
Cache.prototype.keys = function () {
    return Object.keys(this.cache)
}

/**
 * @name Cache#all
 * @desc Returns object of all cached items
 * @function
 * @return {object}
 */
Cache.prototype.all = function () {
    let items = {}
    for (let key in this.cache) {
        items[key] = this.cache[key].value
    }
    return items
}

/**
 * @name Cache#flush
 * @desc Clears all items from the cache
 * @function
 * @returns {Thenable} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.flush = function () {
    this.cache = {}
    return this.context.globalState.update(this.namespace, undefined)
}

/**
 * @name Cache#expiration
 * @desc Gets the expiration time for the cached item
 * @function
 * @param {string} key - The unique key for the cached item
 * @return {number} Unix Timestamp in seconds
 */
Cache.prototype.getExpiration = function (key) {
    if (typeof this.cache[key] === 'undefined' || typeof this.cache[key].expiration === 'undefined') {
        return undefined
    } else {
        return this.cache[key].expiration
    }
}

/**
 * @name Cache#isExpired
 * @desc Checks to see if cached item is expired
 * @function
 * @param {object} item - Cached item object
 * @return {boolean}
 */
Cache.prototype.isExpired = function (key) {
    // If key doesn't exist or it has no expiration
    if (typeof this.cache[key] === 'undefined' || typeof this.cache[key].expiration === 'undefined') {
        return false
    } else {
        // Is expiration >= right now?
        return now() >= this.cache[key].expiration
    }
}

/**
 * @name now
 * @desc Helper function to get the current timestamp
 * @function
 * @private
 * @return {number} Current Unix Timestamp in seconds
 */
const now = function () {
    return Math.floor(Date.now() / 1000)
}

module.exports = Cache
