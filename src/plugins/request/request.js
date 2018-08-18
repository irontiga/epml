'use strict'

import genUUID from '../../helpers/genUUID.js'
import Target from '../../EpmlCore/Target.js'

const REQUEST_MESSAGE_TYPE = 'REQUEST'
const REQUEST_RESPONSE_MESSAGE_TYPE = 'REQUEST_RESPONSE'

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
        Epml.registerEpmlMessageType(REQUEST_RESPONSE_MESSAGE_TYPE, requestResponseHandler)
    }
}

const requestFn = function (requestType, data, timeout) {
    // console.log(this)
    return Promise.all(this.targets.map(target => {
        const uuid = genUUID()

        const message = {
            EpmlMessageType: REQUEST_MESSAGE_TYPE,
            requestOrResponse: 'request',
            requestID: uuid,
            requestType,
            data
        }

        target.sendMessage(message)

        return new Promise((resolve, reject) => {
            // console.log('PROMISEEEE')
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
            // console.log(responses)
            // If an instance only has one target, don't return the array. That'd be weird
            if (this.targets.length === 1) return responses[0]
        })
}

function requestResponseHandler (data, target) {
    // console.log("REQUESSTTT", data, pendingRequests)
    // console.log('IN REQUESTHANDLER', pendingRequests, data)
    if (data.requestID in pendingRequests) {
        pendingRequests[data.requestID](data.data)
    } else {
        console.warn('requestID not found in pendingRequests')
    }
}

function requestHandler (data, target) {
    // console.log('REQUESTHANLDER')
    // console.log(routeMap)
    if (!routeMap.has(target)) {
        // Error, route does not exist
        console.warn(`Route does not exist - missing target`)
        return
    }
    const routes = routeMap.get(target)
    // console.log(data, routes)
    const route = routes[data.requestType]
    if (!route) {
        // Error, route does not exist
        console.warn('Route does not exist')
        return
    }
    // console.log('CALLING FN')
    route(data, target)
}

function createRoute (route, fn) {
    console.log(`CREATING ROUTTTEEE "${route}"`)
    if (!this.routes) this.routes = {}

    if (this.routes[route]) return

    for (const target of this.targets) {
        if (!routeMap.has(target)) {
            routeMap.set(target, {})
        }

        const routes = routeMap.get(target)

        routes[route] = (data, target) => {
            // console.log('ROUTE FN CALLED', data)
            // User supllied route function. This will turn it into a promise if it isn't one, or it will leave it as one.
            Promise.resolve(fn(data))
                .then((response) => {
                    // response = this.constructor.prepareOutgoingData(response)
                    response = Target.prepareOutgoingData(response)
                    target.sendMessage({
                        data: response,
                        EpmlMessageType: REQUEST_RESPONSE_MESSAGE_TYPE,
                        requestOrResponse: 'request',
                        requestID: data.requestID
                    })
                })
        }
    }

    // console.log('hello')
}

export default requestPlugin
