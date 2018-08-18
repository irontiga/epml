'use strict';

// IE8 event listener support...probably going to be pointless in the end
function bindEvent (element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    } else {
        throw new Error('Could not bind event.')
    }
}

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
class ContentWindowTarget extends Target {
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
        return 'WINDOW'
    }

    static get name () {
        return 'Content window plugin'
    }

    static get description () {
        return `Allows Epml to communicate with iframes and popup windows.`
    }

    static test (source) {
        if (typeof source !== 'object') return false
        // console.log('FOCUS FNS', source.focus === window.focus)
        return (source === source.window && source.focus === window.focus)
    }

    isFrom (source) {
        //
    }

    constructor (source) {
        super(source);

        if (source.contentWindow) source = source.contentWindow;

        // If the source already has an existing target object, simply return it.
        if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

        if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

        this._source = source;

        this._sourceOrigin = source.origin;

        sourceTargetMap.set(source, this);

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
 * Epml content windows plugin. Enables communication with iframes and popup windows
 */
var contentWindows = {
    init: function (Epml) {
        // const proto = Epml.prototype

        bindEvent(window, 'message', event => {
            // console.log(event)
            if (!ContentWindowTarget.hasTarget(event.source)) return
            Epml.handleMessage(event.data, ContentWindowTarget.getTargetFromSource(event.source));
            // Epml.handleMessage(event.data, event.source, message => {
            //     event.source.postMessage(message, event.origin)
            // })
        });

        // Epml.addTargetConstructor(ContentWindowTarget)
        Epml.registerTargetType(ContentWindowTarget.type, ContentWindowTarget);

        // Epml.addTargetHandler({
        //     targetType: 'WINDOW', // Unique type for each target type
        //     name: 'Content window',
        //     description: 'Allows Epml to communicate with iframes and popup windows',
        //     isMatchingTargetSource: function (source) {
        //         if (typeof source !== 'object') return false

        //         source = source.contentWindow || source
        //     },
        //     createTarget: function (source) {
        //         targetWindows.push({
        //             source,
        //             eventIsFromSource: function (event) {
        //                 if (event.source === source) return true
        //                 return false
        //             }
        //         })
        //         return {
        //             sendMessage: function (data) {
        //                 return source.postMessage(data, source.origin)
        //             }
        //         }
        //     }
        // })
    }
}

module.exports = contentWindows;
