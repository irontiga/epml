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

    static getTarget (source) {
        return sourceTargetMap.get(source)
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

        if (source.contentWindow) source = source.contentWindow

        return (source === source.window && source.focus === window.focus)
    }

    isFrom (source) {
        //
    }

    constructor (source) {
        super()

        // If the source already has an existing target object, simply return it.
        if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

        if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

        this._source = source

        sourceTargetMap.set(source, this)

        // targetWindows.push(source)
    }

    get source () {
        return this._source
    }
}
export default ContentWindowTarget
