'use strict'

import Target from './Target.js'

const messageTypes = {}
const targetTypes = {}

/**
 * Epml core. Useless on it's own. Needs plugins in order to "do" anything
 * @module Epml
 */

// const epmlRequestTypeHandlers = {}
// const targetConstructors = []

const allTargets = [] // No duplication
// Change this to have id based targets, and therefore the ability to access any target anywhere always as long as you have it's id (don't need to pass objects around)
// const allTargets = {}

/**
 * Epml core. All plugins build off this
 * @constructor
 */
export default class Epml {
    /**
     * Installs a plugin "globally". Every new and existing epml instance will have this plugin enabled
     * @param {object} plugin - Epml plugin
     * @param {object} options - Options config object
     */
    static registerPlugin (plugin, options) {
        plugin.init(Epml, options)
        return Epml
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
    // /**
    //  * Adds a new target contructor
    //  * @param {TargetConstructor} TargetConstructor - Has many methods...
    //  * @param {function} targetConstructor.isValidTarget - Takes a target and returns true if this constructor can handle this type of target
    //  */
    // static addTargetConstructor (TargetConstructor) {
    //     if (!(TargetConstructor instanceof Target)) throw new Error(`TargetConstructor must inherit from the Target base class.`)
    //     targetConstructors.push(TargetConstructor)
    // }

    static registerTargetType (type, targetConstructor) {
        if (type in targetTypes) throw new Error('Target type has already been registered')
        if (!(targetConstructor.prototype instanceof Target)) throw new Error('Target constructors must inherit from the Target base class')
        targetTypes[type] = targetConstructor
        return Epml
    }

    static registerEpmlMessageType (type, fn) {
        messageTypes[type] = fn
        return Epml
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
     * @param {Target} target - Target object from which the message was received
     */
    static handleMessage (strData, target) {
        // Changes to targetID...and gets fetched through Epml.targets[targetID]...or something like that
        const data = Epml.prepareIncomingData(strData)
        // console.log(target)
        if ('EpmlMessageType' in data) {
            messageTypes[data.EpmlMessageType](data, target)
        }
        // Then send a response or whatever back with target.sendMessage(this.constructor.prepareOutgoingData(someData))
    }

    /**
    * Prepares data for processing. Take JSON string and return object
    * @param {string} strData - JSON data in string form
    */
    static prepareIncomingData (strData) {
        if (typeof strData !== 'string') {
            // If sending object is enabled then return the string...otherwise stringify and then parse (safeguard against code injections...whatever the word for that was)
            return strData
        }
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
            if (targetSource.allowObjects === undefined) targetSource.allowObjects = false
            targets.push(...Epml.createTarget(targetSource))
        }

        return targets
    }

    /**
     * Takes a single target source and returns an array of target object
     * @param {any} targetSource - Can be any target source for which a targetConstructor has been installed
     * @return {Object} - Target object
     */
    static createTarget (targetSource) {
        /*
            {
                source: myContentWindow / "my_channel" / "myWorker.js",
                type: 'WINDOW' / 'BROADCAST_CHANNEL' / 'WORKER',
                allowObjects: Bool
            }
        */

        // const TargetConstructor = targetConstructors.find(tCtor => tCtor.test(targetSource))
        // const newTarget = new TargetConstructor(targetSource)
        // console.log(targetTypes, targetTypes[targetSource.type])
        if (!targetTypes[targetSource.type]) {
            throw new Error(`Target type '${targetSource.type}' not registered`)
        }
        let newTargets = new targetTypes[targetSource.type](targetSource.source)
        if (!Array.isArray(newTargets)) newTargets = [newTargets]
        for (const newTarget of newTargets) {
            if (allTargets.indexOf(newTarget) === -1) allTargets.push(newTarget)
            newTarget.allowObjects = targetSource.allowObjects
        }
        return newTargets
    }

    /**
     * Creates a new Epml instance
     * @constructor
     * @param {Object|Object[]} targets - Target instantiation object or an array of them
     */
    constructor (targets) {
        this.targets = this.constructor.createTargets(targets)
    }
}
