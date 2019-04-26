'use strict'

import { EpmlStream, STREAM_UPDATE_MESSAGE_TYPE } from './Stream.js'

export { EpmlStream }

const JOIN_STREAM_MESSAGE_TYPE = 'JOIN_STREAM'

/**
 * Epml streams module. Wrapper for asynchronous requests and responses (routes)
 * @module plugins/request/request.js
 */
// Maps a target to an array of routes
// const routeMap = new Map()

// const pendingRequests = {}

// allStreams = Streams.allStreams

// // Server
// const targetsToStreamsMap = new Map()

// // Client
const subscriptions = {}

/**
 * Request plugin
 */
export const EpmlStreamPlugin = {
    init: (Epml, options) => {
        // if (Epml.prototype.connectStream) throw new Error('Epml.prototype.connectStream is already defined')
        if (Epml.prototype.subscribe) throw new Error('Epml.prototype.subscribe is already defined')

        if (Epml.prototype.createStream) throw new Error(`Empl.prototype.createStream is already defined`)

        Epml.prototype.subscribe = subscribe

        Epml.registerEpmlMessageType(JOIN_STREAM_MESSAGE_TYPE, joinStream)
        Epml.registerEpmlMessageType(STREAM_UPDATE_MESSAGE_TYPE, receiveData)
    }
}

// 'server'side...on the side of myStream = new Stream('myStream'[, joinFn]).
const joinStream = function (req, target) {
    // if (!targetsToStreamsMap.has(target)) {
    //     // Error, route does not exist
    //     console.warn(`Stream does not exist - missing target`)
    //     return
    // }
    const name = req.data.name
    // const streamToJoin = targetsToStreamsMap.get(target)[name]
    const streamToJoin = EpmlStream.streams[name]
    if (!streamToJoin) {
        console.warn(`No stream with name ${name}`, this)
        return
    }

    streamToJoin.subscribe(target)
}

// Gives an Epml instance access to a stream...maybe
// const connectStream = function (streamInstance) {
//     //
// }

// No such thing as Epml.createStream...just myStream = new Epml.Stream()

// Client side
// EpmlInstance.subscribe(...)
const subscribe = function (name, listener) {
    this.targets.forEach(target => {
        target.sendMessage({
            EpmlMessageType: JOIN_STREAM_MESSAGE_TYPE,
            data: { name }
        })
    })
    subscriptions[name] = subscriptions[name] || []
    subscriptions[name].push(listener)
}
// Client side
// Called on STREAM_UPDATE_MESSAGE_TYPE message
const receiveData = function (message, target) {
    // console.log('data', message, target)
    subscriptions[message.streamName].forEach(listener => listener(message.data))
}
