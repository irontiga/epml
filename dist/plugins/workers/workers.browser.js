var EpmlWorkerPlugin = (function () {
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

    const sourceTargetMap = new Map();

    /**
     * Can only take ONE iframe or popup as source
     */
    class WorkerTarget extends Target {
        static get sources () {
            return Array.from(sourceTargetMap.keys())
        }

        static get targets () {
            return Array.from(sourceTargetMap.values())
        }

        static getTargetFromSource (source) {
            return sourceTargetMap.get(source)
        }

        static hasTarget (source) {
            return sourceTargetMap.has(source)
        }

        static get type () {
            return 'WORKER'
        }

        static get name () {
            return 'Web/Service worker plugin'
        }

        static get description () {
            return `Allows Epml to communicate with web and service workers.`
        }

        static test (source) {
            if (typeof source !== 'object') return false
            // console.log('FOCUS FNS', source.focus === window.focus)

            return ((typeof WorkerGlobalScope !== 'undefined' && source instanceof WorkerGlobalScope) || source instanceof Worker)
        }

        isFrom (source) {
            //
        }

        constructor (source) {
            super(source);

            // if (source.contentWindow) source = source.contentWindow

            // If the source already has an existing target object, simply return it.
            if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

            if (!this.constructor.test(source)) throw new Error(`Source can not be used with target type '${this.constructor.type}'`)

            if (!this.constructor.EpmlReference) throw new Error('No Epml(core) reference')

            this._source = source;

            sourceTargetMap.set(source, this);

            // And listen for messages
            // console.log(source)
            source.onmessage = event => {
                // console.log(event)
                this.constructor.EpmlReference.handleMessage(event.data, this);
            };
            // targetWindows.push(source)
        }

        get source () {
            return this._source
        }

        sendMessage (message) {
            message = Target.prepareOutgoingData(message);
            this._source.postMessage(message, this._sourceOrigin);
        }
    }

    /**
     * Epml webworker plugin. Enables communication with web/service workers
     */
    var workers = {
        init: function (Epml) {
            // Adding the listener to the worker requires a reference to Epml for the handleMessage method
            WorkerTarget.EpmlReference = Epml;

            // Epml.addTargetConstructor(ContentWindowTarget)
            Epml.registerTargetType(WorkerTarget.type, WorkerTarget);
        }
    }

    return workers;

}());
