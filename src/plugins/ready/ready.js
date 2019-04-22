/**
 * Requires epml-request plugin...or not
 */
import genUUID from '../../helpers/genUUID.js'

const READY_CHECK_INTERVAL = 15 // ms
const READY_MESSAGE_TYPE = 'EPML_READY_STATE_CHECK'
const READY_MESSAGE_RESPONSE_TYPE = 'EPML_READY_STATE_CHECK_RESPONSE'

const pendingReadyRequests = {}

const readyPlugin = {
    init: (Epml, options) => {
        // if (!Epml.prototype.request) throw new Error('Requires request plugin')

        if (Epml.prototype.ready) throw new Error('Epml.prototype.ready is already defined')
        if (Epml.prototype.imReady) throw new Error('Epml.prototype.imReady is already defined')

        Epml.prototype.ready = readyPrototype
        Epml.prototype.resetReadyCheck = resetCheckReadyPrototype
        Epml.prototype.imReady = imReadyPrototype

        // Being asked if ready
        Epml.registerEpmlMessageType(READY_MESSAGE_TYPE, respondToReadyRequest)

        // Getting a response after polling for ready
        Epml.registerEpmlMessageType(READY_MESSAGE_RESPONSE_TYPE, readyResponseHandler)
    }
}

// This is the only part in the other "window"
function respondToReadyRequest (data, target) {
    if (!target._i_am_ready) return
    target.sendMessage({
        EpmlMessageType: READY_MESSAGE_RESPONSE_TYPE,
        requestID: data.requestID
    })
}

function imReadyPrototype () {
    // console.log('I\'m ready called', this)
    for (const target of this.targets) {
        target._i_am_ready = true
    }
    // this._ready_plugin.imReady = true
}

// myEpmlInstance.ready().then(...)
function readyPrototype () {
    this._ready_plugin = this._ready_plugin || {}

    this._ready_plugin.pendingReadyResolves = this._ready_plugin.pendingReadyResolves ? this._ready_plugin.pendingReadyResolves : [] // Call resolves when all targets are ready

    if (!this._pending_ready_checking) {
        this._pending_ready_checking = true
        checkReady.call(this, this.targets)
            .then(() => {
                this._ready_plugin.pendingReadyResolves.forEach(resolve => resolve())
            })
    }

    return new Promise(resolve => {
        if (this._ready_plugin.isReady) {
            resolve()
        } else {
            this._ready_plugin.pendingReadyResolves.push(resolve)
        }
    })
}

function resetCheckReadyPrototype () {
    this._ready_plugin = this._ready_plugin || {}
    this._ready_plugin.isReady = false
}

function checkReady (targets) {
    // console.log('Checking', targets)
    this._ready_plugin = this._ready_plugin || {}
    this._ready_plugin.pendingReadyResolves = []

    return Promise.all(targets.map(target => {
        return new Promise((resolve, reject) => {
            const id = genUUID()
            // Send a message at an interval.
            const inteval = setInterval(() => {
                // console.log('interval')
                // , this, window.location
                target.sendMessage({
                    EpmlMessageType: READY_MESSAGE_TYPE,
                    requestID: id
                })
            }, READY_CHECK_INTERVAL)

            // Clear the interval and resolve the promise
            pendingReadyRequests[id] = () => {
                // console.log('RESOLVING')
                clearInterval(inteval)
                resolve()
            }
        })
    })).then(() => {
        this._ready_plugin.isReady = true
    })
}

// Sets ready for a SINGLE TARGET
function readyResponseHandler (data, target) {
    // console.log('response')
    // console.log('==== THIS TARGET IS REEEEEAAADDDDYYY ====')
    // console.log(target)

    target._ready_plugin = target._ready_plugin || {}
    target._ready_plugin._is_ready = true

    pendingReadyRequests[data.requestID]()
}

export default readyPlugin
