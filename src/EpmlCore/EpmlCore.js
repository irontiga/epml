'use strict'

import Target from './Target.js'

/**
 * Epml core. Useless on it's own. Needs plugins in order to "do" anything
 * @module EpmlCore
 */

// const epmlRequestTypeHandlers = {}
const targetConstructors = []

/**
 * Epml core. All plugins build off this
 * @constructor
 */
export default class EpmlCore {
    /**
     * Installs a plugin "globally". Every new and existing epml instance will have this plugin enabled
     * @param {object} plugin - Epml plugin
     */
    static registerPlugin (plugin, options) {
        plugin.init(EpmlCore, options)
        return EpmlCore
    }

    // /**
    //  * Adds a request handler function. Will be called whenever a message has a requestType corressponding to the supplied type
    //  * @param {string} type - Unique request identifier
    //  * @param {function} fn - Function to handle requests of this type
    //  */
    // static addRequestHandler (type, fn) {
    //     if (epmlRequestTypeHandlers[type]) throw new Error(`${type} is already defined`)

    //     epmlRequestTypeHandlers[type] = fn
    // }

    /**
     * @typedef TargetConstructor - Target constructor. Return a Target
     */
    /**
     * Adds a new target contructor
     * @param {TargetConstructor} TargetConstructor - Has many methods...
     * @param {function} targetConstructor.isValidTarget - Takes a target and returns true if this constructor can handle this type of target
     */
    static addTargetConstructor (TargetConstructor) {
        if (!(TargetConstructor instanceof Target)) throw new Error(`TargetConstructor must inherit from the Target base class.`)
        targetConstructors.push(TargetConstructor)
    }

    /**
     * Installs a plugin for only this instance
     * @param {object} plugin - Epml plugin
     */
    registerPlugin (plugin) {
        plugin.init(this)
        return this
    }

    /**
     * Takes data from an event and figures out what to do with it
     * @param {object} strData - String data received from something like event.data
     * @param {function} sendFn - Function used to send a message (JSON) to the
     */
    static handleMessage (strData, sendFn) {
        const data = EpmlCore.prepareIncomingData(strData)
        console.log(data)
    }

    /**
     * Last step before sending data. Turns it into a string (obj->JSON)
     * @param {object} data
     */
    static prepareOutgoingData (data) {
        return JSON.stringify(data)
    }

    /**
     * Prepares data for processing. Take JSON string and return object
     * @param {string} strData - JSON data in string form
     */
    static prepareIncomingData (strData) {
        return JSON.parse(strData)
    }

    /**
     * Takes (a) target(s) and returns an array of target Objects
     * @param {Object|Object[]} targets
     * @returns {Object[]} - An array of target objects
     */
    static createTargets (targetSources) {
        if (!Array.isArray(targetSources)) targetSources = [targetSources]

        const targets = []

        for (const targetSource of targetSources) {
            targets.push(...EpmlCore.createTarget(targetSource))
        }

        return targets
    }

    /**
     * Takes a single target source and returns an array of target object
     * @param {any} targetSource - Can be any target source for which a targetConstructor has been installed
     * @return {Object} - Target object
     */
    static createTarget (targetSource) {
        const TargetConstructor = targetConstructors.find(tCtor => tCtor.test(targetSource))
        return new TargetConstructor(targetSource)
    }

    /**
     * Creates a new Epml instance
     * @constructor
     * @param {*} targets
     */
    constructor (targets) {
        this.targets = EpmlCore.createTargets(targets)
    }
}
