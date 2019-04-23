import Target from '../../EpmlCore/Target.js'

export const EMIT_STREAM_MESSAGE_TYPE = 'EMIT_STREAM'

const allStreams = {} // Maybe not even needed

export class Stream {
    static get streams () {
        return allStreams
    }

    constructor (name, allowedToJoin, subscriptionFn = () => {}) {
        this._name = name // Stream name
        this.targets = [] // Targets listening to the stream
        this._allowedToJoin = allowedToJoin
        this._subscriptionFn = subscriptionFn // Called on subscription, whatever it returns we send to the new target
        allStreams[name] = this
    }

    targetCanJoin (target) {
        return this._allowedToJoin.indexOf(target) > -1
    }

    async subscribe (target) {
        if (target in this.targets) {
            console.info('Target is already subscribed to this stream')
        }
        const response = await this._subscriptionFn()
        this._sendMessage(response, target)
        this.targets.push(target)
    }

    _sendMessage (data, target) {
        target.sendMessage({
            data: Target.prepareOutgoingData(data),
            EpmlMessageType: EMIT_STREAM_MESSAGE_TYPE,
            streamName: this._name
        })
    }

    emit (data) {
        this.targets.forEach(target => this._sendMessage(data, target))
    }
}
