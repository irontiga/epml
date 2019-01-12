// Proxy is a "normal" target, but it intercepts the message, changes the type, and passes it on to the target window, where it's received by the proxy handler...message type reverted, and passed to handleMessage with the actual target
'use strict'

import ProxyTarget from './Proxy2Target.js'

import { PROXY_MESSAGE_TYPE } from './proxy2Constants.js'
// import Target from '../../EpmlCore/Target.js';
// Stores id => target (and reverse). Can be used in the host and the target...targets just have different roles :)
// const proxySources = new TwoWayMap() // Map id to it's target :) OOOHHHHH....MAYBE THIS SHOULD BE IN THE PROXYTARGET...AND IT GET ACCESSED FROM HERE. DUH!!!
// ProxyTarget.proxySources = proxySources // :)
const proxySources = ProxyTarget.proxySources
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

        Epml.registerProxyInstance = registerProxyInstance

        Epml.registerEpmlMessageType(PROXY_MESSAGE_TYPE, proxyMessageHandler)
    }
}

function proxyMessageHandler (data, target) {
    // console.log(data)
    // SWITCH BASED ON STATE === TRANSIT OR DELIVERY
    // If it's in transit, then look up the id in the map and pass the corresponding target...
    // YES! Instead of creating a new target that will translate to send to the thing....you look up the source's id....it will (have to) correspond to the source object created in this window :)

    if (data.state === 'TRANSIT') {
        // This fetches an epml instance which has the id, and so has the targets inside of it...i guess
        const targetInstance = proxySources.getByKey(data.target)
        if (!targetInstance) {
            console.warn(`Target ${data.target} not registered.`)
            return
        }

        data.state = 'DELIVERY'
        // console.log(targetInstance)
        targetInstance.targets.forEach(target => target.sendMessage(data))
        // targets.targets[0].sendMessage(data)
    } else if (data.state === 'DELIVERY') {
        // This target is a target created through type: proxy
        const target = proxySources.getByKey(data.target)
        // console.log(target)
        // console.log(proxySources)
        // console.log(data)
        EpmlReference.handleMessage(data.message, target)
    }
}

// NOT A TARGET....IT'S AN EPML INSTANCE
function registerProxyInstance (id, target) {
    // console.log(target, id)
    if (proxySources.hasKey(id)) console.warn(`${id} is already defined. Overwriting...`)
    proxySources.push(id, target)
    // console.log(proxySources)
}

// I need to pass the proxySources twowaymap to the proxyTarget object, so that any new target created through it can be pushed to it
