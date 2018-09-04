// Proxy target source will be another instance of epml. The source instance will be the proxy. The extra parameter will be the target for that proxy

import Target from '../../EpmlCore/Target.js'
import genUUID from '../../helpers/genUUID.js'
import { PROXY_MESSAGE_TYPE, PROXY_MESSAGE_RESPONSE_TYPE } from './proxyConfig.js'

const sourceTargetMap = new Map()
const proxyTargetMap = new Map()

/**
 * Can only take ONE iframe or popup as source
 */
class ProxyTarget extends Target {
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
        return 'PROXY'
    }

    static get name () {
        return 'Proxy target'
    }

    static get description () {
        return `Uses other target, and proxies requests, allowing things like iframes to communicate through their host`
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

    // Bit different to a normal target, has a second parameter
    constructor (source) {
        super(source)
        /**
         * Source looks like {proxy: epmlInstance, target: 'referenceToTargetInProxy'}
         */

        if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

        this._source = source

        // sourceTargetMap.set(source, this)
        proxyTargetMap.set(source.proxy)
        let proxyTargets
        if (proxyTargetMap.has(source.proxy)) {
            proxyTargets = proxyTargetMap.get(source.proxy)
        } else {
            proxyTargets = {}
        }
        if (proxyTargets[source.target]) return proxyTargets[source.target]

        proxyTargets[source.target] = this

        // targetWindows.push(source)
    }

    get source () {
        return this._source
    }

    sendMessage (message) {
        // ID for the proxy
        const uuid = genUUID()

        message = Target.prepareOutgoingData(message)

        message = {
            EpmlMessageType: PROXY_MESSAGE_TYPE,
            requestID: uuid,
            target: this._source.target,
            message
        }

        this._source.proxy.sendMessage(message)
    }
}

export default ProxyTarget
