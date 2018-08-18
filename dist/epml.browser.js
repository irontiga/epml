var Epml = (function () {
    'use strict';

    /**
     * Base class for a target. Has checks in place to validate Target objects
     * @module Target
     */

    class Target {
        /**
            * Last step before sending data. Turns it into a string (obj->JSON)
            * @param {object} data
            */
        static prepareOutgoingData (data) {
            return JSON.stringify(data)
        }

        constructor (source) {
            if (!source) throw new Error('Source must be spcified')

            // Not needed, uses type instead
            // if (!this.constructor.test) throw new Error('Class requires a static `test` method in order to check whether or not a source is compatible with the constructor')

            if (!this.constructor.type) throw new Error(`Type not defined`)

            if (!this.constructor.name) console.warn(`No name provided`);

            if (!this.constructor.description) console.warn('No description provided');

            if (!this.sendMessage) throw new Error('A new target requires a sendMessage method')
        }
    }

    const messageTypes = {};
    const targetTypes = {};

    /**
     * Epml core. All plugins build off this
     * @constructor
     */
    class EpmlCore {
        /**
         * Installs a plugin "globally". Every new and existing epml instance will have this plugin enabled
         * @param {object} plugin - Epml plugin
         * @param {object} options - Options config object
         */
        static registerPlugin (plugin, options) {
            plugin.init(EpmlCore, options);
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
            targetTypes[type] = targetConstructor;
        }

        static registerEpmlMessageType (type, fn) {
            messageTypes[type] = fn;
        }

        /**
         * Installs a plugin for only this instance
         * @param {object} plugin - Epml plugin
         */
        registerPlugin (plugin) {
            plugin.init(this);
            return this
        }

        /**
         * Takes data from an event and figures out what to do with it
         * @param {object} strData - String data received from something like event.data
         * @param {Target} target - Target object from which the message was received
         */
        static handleMessage (strData, target) {
            const data = EpmlCore.prepareIncomingData(strData);

            if ('EpmlMessageType' in data) {
                messageTypes[data.EpmlMessageType](data, target);
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
            if (!Array.isArray(targetSources)) targetSources = [targetSources];

            const targets = [];

            for (const targetSource of targetSources) {
                if (targetSource.allowObjects === undefined) targetSource.allowObjects = false;
                targets.push(...EpmlCore.createTarget(targetSource));
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
            let newTargets = new targetTypes[targetSource.type](targetSource.source);
            if (!Array.isArray(newTargets)) newTargets = [newTargets];
            for (const newTarget of newTargets) {
                newTarget.allowObjects = targetSource.allowObjects;
            }
            return newTargets
        }

        /**
         * Creates a new Epml instance
         * @constructor
         * @param {Object|Object[]} targets - Target instantiation object or an array of them
         */
        constructor (targets) {
            this.targets = this.constructor.createTargets(targets);
        }
    }

    return EpmlCore;

}());
