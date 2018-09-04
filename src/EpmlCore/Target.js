/**
 * Base class for a target. Has checks in place to validate Target objects
 * @module Target
 */

export default class Target {
    // // Need a static getter to check for inheritance...otherwise browser bundles can break
    // static get _isInheritedFromTargetBaseClass () {
    //     return true
    // }
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

        if (!this.constructor.name) console.warn(`No name provided`)

        if (!this.constructor.description) console.warn('No description provided')

        if (!this.sendMessage) throw new Error('A new target requires a sendMessage method')
    }
}
