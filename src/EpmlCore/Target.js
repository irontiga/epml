/**
 * Base class for a target. Has checks in place to validate Target objects
 * @module Target
 */

export default class Target {
    constructor (source) {
        if (!source) throw new Error('Source must be spcified')

        if (!this.constructor.test) throw new Error('Class requires a static `test` method in order to check whether or not a source is compatible with the constructor')

        if (!this.constructor.type) throw new Error(`Type not defined`)

        if (!this.constructor.name) console.warn(`No name provided`)

        if (!this.constructor.description) console.warn('No description provided')
    }
}
