// Proxy target source will be another instance of epml. The source instance will be the proxy. The extra parameter will be the target for that proxy

import Target from '../../EpmlCore/Target.js'
import genUUID from '../../helpers/genUUID.js'
import TwoWayMap from './TwoWayMap.js'
// import { PROXY_MESSAGE_TYPE } from './proxyConfig.js'
import { PROXY_MESSAGE_TYPE } from './proxyConstants.js'

// Stores source.proxy => new Map([[source.target, new ProxyTarget(source)]])
const proxySources = new TwoWayMap()

/**
 *  source = {
 *      target:'frame1',
 *      proxy: epmlInstance
 *  }
 */

/**
 * Can only take ONE iframe or popup as source
 */
class ProxyTarget extends Target {
    static get proxySources () {
        return proxySources
    }

    static get sources () {
        const sources = []
        for (const [proxySource, valueMap] of proxySources) {
            for (const [target] of valueMap) {
                sources.push({
                    target,
                    proxy: proxySource
                })
            }
        }
        Array.from(proxySources.entries()).map((sourceProxy, valueMap) => {
            return {
                proxy: sourceProxy,
                target: Array.from(valueMap.keys())[0]
            }
        })
    }
    // ==================================================
    // ALL THIS NEEDS REWORKING. BUT PROBABLY NOT URGENT
    // ==================================================
    static get targets () {
        return Array.from(proxySources.values())
    }

    static getTargetFromSource (source) {
        return proxySources.getByValue(source)
    }

    static hasTarget (source) {
        return proxySources.hasValue(source)
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
        if (!(source.proxy instanceof this.Epml)) return false
        // return (source === source.window && source.focus === window.focus)
        return true
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

        this.constructor.proxySources.push(source.id, this)

        if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

        this._source = source
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
            // proxyMessageType: 'REQUEST',
            state: 'TRANSIT',
            requestID: uuid,
            target: this._source.target, // 'frame1' - the registered name
            message,
            id: this._source.id
        }

        // console.log(this._source)
        // Doesn't need to loop through, as a proxy should only ever have a single proxy target (although the target can have multiple...it just shouldn't send THROUGH multiple targets)
        this._source.proxy.targets[0].sendMessage(message)
        // this._source.proxy.targets.forEach(target => target.sendMessage(messaage))
    }
}

export default ProxyTarget
