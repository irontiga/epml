import Target from '../../EpmlCore/Target.js'
import genUUID from '../../helpers/genUUID.js'
import { PROXY_MESSAGE_TYPE } from './proxyConfig.js'

const sourceTargetMap = new Map() // Stores all the targets, in order to avoid duplicates

class ProxySourceTarget extends Target {
    static get sources () {
        return Array.from(sourceTargetMap.keys())
    }

    static get targets () {
        return Array.from(sourceTargetMap.values())
    }

    static getTargetFromSource (source) {
        return sourceTargetMap.get(source.clientID)
    }

    static hasTarget (source) {
        return sourceTargetMap.has(source.clientID)
    }

    static get type () {
        return 'PROXY_SOURCE'
    }

    static get name () {
        return 'Proxy source target'
    }

    static get description () {
        return `Poses as a target, but converts messages and passes them on to the proxy's target`
    }

    static test (source) {
        if (typeof source !== 'object') return false
        // console.log('FOCUS FNS', source.focus === window.focus)
        if (!(source.proxy instanceof this.constructor.Epml)) return false
        // return (source === source.window && source.focus === window.focus)
    }

    isFrom (source) {
        //
    }

    constructor (source) {
        super(source)
        this._target = source.proxyTarget
        this._clientID = source.clientID
    }

    get source () {
        return this._source
    }

    sendMessage (message) {
        message = Target.prepareOutgoingData(message)

        message = {
            EpmlMessageType: PROXY_MESSAGE_TYPE,
            proxyMessageType: 'RESPONSE',
            targetID: this._clientID,
            message
        }

        this._source.proxy.sendMessage(message)
    }
}

export default ProxySourceTarget
