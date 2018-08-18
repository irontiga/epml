import Target from '../../EpmlCore/Target.js'

const sourceTargetMap = new Map()

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
        super(source)

        // if (source.contentWindow) source = source.contentWindow

        // If the source already has an existing target object, simply return it.
        if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

        if (!this.constructor.test(source)) throw new Error(`Source can not be used with target type '${this.constructor.type}'`)

        if (!this.constructor.EpmlReference) throw new Error('No Epml(core) reference')

        this._source = source

        // sourceTargetMap.set(source, this)

        // And listen for messages
        // console.log(source)
        source.onmessage = event => {
            // console.log(event)
            // console.log(this)
            this.constructor.EpmlReference.handleMessage(event.data, this)
        }
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
export default WorkerTarget
