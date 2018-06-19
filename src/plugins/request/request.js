'use strict'

import genUUID from '../../helpers/genUUID.js'

const REQUEST_MESSAGE_TYPE = 'REQUEST'

/**
 * Epml request module. Wrapper for asynchronous requests and responses (routes)
 * @module plugins/request/request.js
 */
// Maps a target to an array of routes
const routeMap = new Map()

const pendingRequests = {}

/**
 * Request plugin
 */
const requestPlugin = {
    init: (Epml, options) => {
        if (Epml.prototype.request) throw new Error('Epml.prototype.request is already defined')

        if (Epml.prototype.route) throw new Error(`Empl.prototype.route is already defined`)

        Epml.prototype.request = requestFn

        Epml.prototype.route = createRoute

        Epml.registerEpmlMessageType(REQUEST_MESSAGE_TYPE, requestHandler)
    }
}

const requestFn = function (requestType, data, timeout) {
    // console.log(this)
    return Promise.all(this.targets.map(target => {
        const uuid = genUUID()

        const message = {
            EpmlMessageType: REQUEST_MESSAGE_TYPE,
            requestID: uuid,
            requestType,
            data
        }

        target.sendMessage(message)

        return new Promise((resolve, reject) => {
            let timeOutFn
            if (timeout) {
                timeOutFn = setTimeout(() => {
                    delete pendingRequests[uuid]
                    reject(new Error('Request timed out'))
                }, timeout)
            }

            pendingRequests[uuid] = (...args) => {
                if (timeOutFn) clearTimeout(timeOutFn)
                resolve(...args)
            }
            // console.log(pendingRequests)
        })
    }))
        .then(responses => {
            console.log(responses)
            // If an instance only has one target, don't return the array. That'd be weird
            if (this.targets.length === 1) return responses[0]
        })
}

/*
TEST FOR SCOPE
*/
let ii = 0
setInterval(() => {
    console.log('IN TINMEOUT', pendingRequests)
    pendingRequests[ii] = ii
    ii++
}, 2000)

const requestHandler = function (data, target) {
    // console.log("REQUESSTTT", data, pendingRequests)
    console.log('IN REQUESTHANDLER', pendingRequests, data.requestID)
    if (data.requestID in pendingRequests) {
        pendingRequests[data.requestID](data)
    } else {
        console.warn('requestID not found in pendingRequests')
    }
}

function createRoute (route, fn) {
    if (!this.routes) this.routes = {}

    if (this.routes[route]) return

    for (const target of this.targets) {
        if (!routeMap.has(target)) {
            routeMap.set(target, [])
        }

        const routes = routeMap.get(target)

        routes.push({
            route,
            fn: function (target, data) {
                // User supllied route function. This will turn it into a promise if it isn't one, or it will leave it as one.
                Promise.resolve(fn(data))
                    .then(function (response) {
                        response = this.constructor.prepareOutgoingData(response)
                        target.sendMessage(response)
                    })
            }
        })
    }

    // console.log('hello')
}

export default requestPlugin
