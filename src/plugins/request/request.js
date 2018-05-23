'use strict'

import genUUID from '../../helpers/genUUID.js'

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
export default {
    init: (Epml, options) => {
        const proto = Epml.prototype

        Epml.addRequestHandler('request', () => {

        })

        if (proto.request) throw new Error('Epml.prototype.request is already defined')

        if (proto.route) throw new Error(`Empl.prototype.route is already defined`)

        proto.request = requestFn

        proto.route = function (route, fn) {
            if (this.routes[route]) return

            for (const target of this.targets) {
                if (!routeMap.has(target)) {
                    routeMap.set(target, [])
                }

                const routes = routeMap.get(target)

                routes.push({
                    route,
                    fn
                })
            }

            console.log('hello')
        }
    }
}

async function requestFn (requestType, data) {
    const uuid = genUUID()
    await new Promise(resolve => {
        pendingRequests[uuid] = resolve
    })
}
