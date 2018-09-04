// Proxy is a "normal" target, but it intercepts the message, changes the type, and passes it on to the target window, where it's received by the proxy handler...message type reverted, and passed to handleMessage with the actual target
'use strict'

import bindEvent from '../../helpers/bindEvent.js'
import { PROXY_MESSAGE_TYPE, PROXY_MESSAGE_RESPONSE_TYPE, PROXIED_MESSAGE_TYPE, PROXIED_MESSAGE_RESPONSE_TYPE } from './proxyConfig.js'
import ProxyTarget from './ProxyTarget.js'

const proxyTargets = {}
const pendingMessages = {}

export default {
    init: function (Epml) {
        // const proto = Epml.prototype

        Object.defineProperty(ProxyTarget, 'Epml', {
            get: () => Epml
        })

        // ProxyTarget.EpmlReference = Epml

        bindEvent(window, 'message', event => {
            // console.log(event)
            if (!ProxyTarget.hasTarget(event.source)) return
            Epml.handleMessage(event.data, ProxyTarget.getTargetFromSource(event.source))
            // Epml.handleMessage(event.data, event.source, message => {
            //     event.source.postMessage(message, event.origin)
            // })
        })

        // Epml.addTargetConstructor(ContentWindowTarget)
        Epml.registerTargetType(ProxyTarget.type, ProxyTarget)

        Epml.registerProxyTarget = registerProxyTarget
        Epml.registerMessageHandler(PROXY_MESSAGE_TYPE, proxyRequestHandler)
        Epml.registerMessageHandler(PROXY_MESSAGE_RESPONSE_TYPE, proxyMessageResponseHandler)
        Epml.registerMessageHandler(PROXIED_MESSAGE_TYPE, proxiedRequestHandler)
        Epml.registerMessageHandler(PROXY_MESSAGE_RESPONSE_TYPE, proxiedMessageResponseHandler)
    }
}

function registerProxyTarget (name, target) {
    if (proxyTargets[name]) console.warn(`${name} is already defined. Overwriting`)
    const targetIndex = Object.values(proxyTargets).indexOf(target)
    if (targetIndex > -1) throw new Error(`Target already registered under name ${proxyTargets[targetIndex]}`)

    proxyTargets.set(name.target)
}

function proxyRequestHandler (data, target) {
    // Pass on to the proxy's target
    if (!this.constructor.Epml.allowProxying) throw new Error('This window can not be used as a proxy. You can enable proxying through \'Epml.allowProxying = true\'')
    const proxyTarget = proxyTargets[data.target]
    if (!proxyTarget) console.warn(`Target ${data.target} not registered.`)
    // const message = this.constructor.Epml.constructor.prepareIncomingData(data.message)
    proxyTarget.sendMessage(data.message)
    pendingMessages[data.id] = {
        target
    }
}

function proxiedRequestHandler (data, target) {

}

function proxyMessageResponseHandler (data, target) {

}

function proxiedMessageResponseHandler (data, target) {

}