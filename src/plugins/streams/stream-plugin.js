'use strict'

import { Stream, EMIT_STREAM_MESSAGE_TYPE } from './Stream.js'

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
const streamPlugin = {
    init: (Epml, options) => {
        // if (Epml.prototype.connectStream) throw new Error('Epml.prototype.connectStream is already defined')
        if (Epml.prototype.subscribe) throw new Error('Epml.prototype.subscribe is already defined')

        if (Epml.prototype.createStream) throw new Error(`Empl.prototype.createStream is already defined`)

        Epml.prototype.subscribe = subscribe

        // Epml.Stream = Stream
        // Epml.prototype.connectStream = connectStream
        Epml.prototype.createStream = createStream

        Epml.registerEpmlMessageType(JOIN_STREAM_MESSAGE_TYPE, joinStream)
        Epml.registerEpmlMessageType(EMIT_STREAM_MESSAGE_TYPE, receiveData)
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
    const streamToJoin = Stream.streams[name]
    if (!streamToJoin) console.warn(`No stream with name ${name}`, this)
    if (!streamToJoin.targetCanJoin(target)) console.warn(`Target not allowed to join stream with name ${name}`, this)

    streamToJoin.subscribe(target)
}

// Serverside... could take an options object I guess?
const createStream = function (name, subscriptionFn) {
    if (!this.streams) this.streams = {}

    if (name in this.streams) throw new Error(`Stream with name ${name} already exists`)

    const newStream = new Stream(name, this.targets, subscriptionFn)
    this.streams[name] = newStream

    // for (const target of this.targets) {
    //     if (!targetsToStreamsMap.has(target)) {
    //         targetsToStreamsMap.set(target, {})
    //     }

    //     const streams = targetsToStreamsMap.get(target)

    //     streams[name] = newStream
    // }
    return newStream
}

// Gives an Epml instance access to a stream...maybe
// const connectStream = function (streamInstance) {
//     //
// }

// No such thing as Epml.createStream...just myStream = new Epml.Stream()

// Client side
const subscribe = function (name, listener) {
    // on new message from stream of name, call listener(data)
    // this._stream_plugin = this._stream_plugin || {}
    // this._stream_plugin.subscriptions = this._stream_plugin.subscriptions || {}
    // this.targets.forEach(target => {
    //     target.sendMessage({
    //         EpmlMessageType: JOIN_STREAM_MESSAGE_TYPE,
    //         data: { name }
    //     })
    // })
    // this._stream_plugin.subscriptions[name] = listener
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
const receiveData = function (message, target) {
    // console.log('data', message, target)
    subscriptions[message.streamName].forEach(listener => listener(message.data))
}

export default streamPlugin
