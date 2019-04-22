import Target from '../../EpmlCore/Target.js'

const sourceTargetMap = new Map()

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
        // if (typeof source !== 'object') return false
        // console.log('FOCUS FNS', source.focus === window.focus)
        // return (source === source.window && source.focus === window.focus) // <- Cause cors is a beach
        return (typeof source === 'object' && source.focus === window.focus)
    }

    isFrom (source) {
        //
    }

    constructor (source) {
        super(source)

        // if (source.contentWindow) source = source.contentWindow // <- Causes issues when cross origin

        // If the source already has an existing target object, simply return it.
        if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

        if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

        this._source = source

        // SHOULD MODIFY. Should become source = { contentWindow, origin } rather than source = contentWindow
        // try {
        //     this._sourceOrigin = source.origin
        // } catch (e) {
        //     // Go away CORS
        //     this._sourceOrigin = '*'
        // }
        this._sourceOrigin = '*'

        sourceTargetMap.set(source, this)

        // targetWindows.push(source)
    }

    get source () {
        return this._source
    }

    sendMessage (message) {
        message = Target.prepareOutgoingData(message)
        this._source.postMessage(message, this._sourceOrigin)
    }
}
export default ContentWindowTarget
