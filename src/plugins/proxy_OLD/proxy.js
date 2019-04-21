// Proxy is a "normal" target, but it intercepts the message, changes the type, and passes it on to the target window, where it's received by the proxy handler...message type reverted, and passed to handleMessage with the actual target
'use strict'

import ProxyTarget from './ProxyTarget.js'
import ProxySourceTarget from './ProxySourceTarget.js'
import TwoWayMap from './TwoWayMap.js'
import genUUID from '../../helpers/genUUID.js'

import { PROXY_MESSAGE_TYPE } from './proxyConstants.js'

const proxyTargets = {} // Name : ID map...ID for below twowaymap
const proxySources = new TwoWayMap() // Maps a source target to an id (the target the proxy request came from). This is used in the proxy window (the window the client and source communicate through)

/**
 * Message types:
 *  - request
 *  - requestDelivery
 *  - response
 *  - responseDelivery
 * Delivery message are the messages being delivered to the proxy target. Other messages are directed towards the proxy
 */
// Probably treat responses and requests the same....just data being passed to a target, with information about the source target
const proxyMessageTypes = {
    'REQUEST': proxyRequestHandler,
    'REQUEST_DELIVERY': proxyRequestDeliveryHandler
    // ,
    // 'RESPONSE': proxyResponseHandler,
    // 'RESPONSE_DELIVERY': proxyResponseDeliveryHandler
}

// There will be two message states....transit or delivery. Transit is sent to the proxy....delivery is sent to the target....the source simply being the target in the opposit direction

let EpmlReference

export default {
    init: function (Epml) {
        // const proto = Epml.prototype

        Object.defineProperty(ProxyTarget, 'Epml', {
            get: () => Epml
        })

        // So that the below functions can access
        EpmlReference = Epml

        // Epml.addTargetConstructor(ContentWindowTarget)
        Epml.registerTargetType(ProxyTarget.type, ProxyTarget)
        Epml.registerTargetType(ProxySourceTarget.type, ProxySourceTarget)

        Epml.registerProxyTarget = registerProxyTarget

        Epml.registerEpmlMessageType(PROXY_MESSAGE_TYPE, proxyMessageHandler)
    }
}

function getProxyTargetID (target) {
    if (proxySources.hasKey(target)) return proxySources.getByKey(target)

    const id = genUUID()
    proxySources.push(target, id)
    return id
}

function registerProxyTarget (name, target) {
    if (proxyTargets[name]) console.warn(`${name} is already defined. Overwriting...`)

    const id = getProxyTargetID(target)
    proxyTargets[name] = id

    // const targetIndex = Object.values(proxyTargets).indexOf(target)
    // if (targetIndex > -1) throw new Error(`Target already registered under name ${proxyTargets[targetIndex]}`)

    // proxyTargets.set(name.target)
}

/**
  * For allowing proxying:
  * In the proxy:
  * Register the target like so:
  * Epml.registerProxyTarget('frame1', frame1EpmlInstance)
  * In the client:
  * Just make the instance like so: `myEpml = new Epml({proxy: someEpmlInstance, target: 'frame1'})`
  */

function proxyMessageHandler (data, target) {
    // data.proxyMessageType = ''
    // console.log(data)
    proxyMessageTypes[data.proxyMessageType](data, target)
}

// In proxy window, target = where the message came from, and so target is really the client...
function proxyRequestHandler (data, target) {
    // Pass on to the proxy's target...targets must be pre-registered (so pretty much if you don't register any proxy targets, you disable proxying)
    // Recipient
    const proxyTarget = proxySources.getByValue(proxyTargets[data.target])
    // proxyTargets[data.target]
    if (!proxyTarget) {
        console.warn(`Target ${data.target} not registered.`)
        return
    }

    data.proxyMessageType = 'REQUEST_DELIVERY'

    // ID of the sender
    const clientID = getProxyTargetID(target)

    data.proxyClientID = clientID

    // console.log(proxyTarget)
    proxyTarget.targets.forEach(target => target.sendMessage(data))
}

// In proxy target window. Now target is the proxy window.
function proxyRequestDeliveryHandler (data, target) {
    // Special target object's sendMessage function sends a proxy message through the proxy :)
    EpmlReference.handleMessage(data.message, new EpmlReference({
        type: 'PROXY_SOURCE',
        source: {
            proxyTarget: target,
            clientTarget: data.proxyClientID
        }
    }))
}
// // In proxy window
// function proxyResponseHandler (data, target) {

// }

// // In proxy client window
// function proxyResponseDeliveryHandler (data, target) {

// }
