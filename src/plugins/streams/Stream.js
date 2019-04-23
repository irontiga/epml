import Target from '../../EpmlCore/Target.js'

export const STREAM_UPDATE_MESSAGE_TYPE = 'STREAM_UPDATE'

const allStreams = {} // Maybe not even needed

export class EpmlStream {
    static get streams () {
        return allStreams
    }

    constructor (name, subscriptionFn = () => {}) {
        this._name = name // Stream name
        this.targets = [] // Targets listening to the stream
        this._subscriptionFn = subscriptionFn // Called on subscription, whatever it returns we send to the new target
        if (name in allStreams) throw new Error(`Stream with name ${name} already exists!`)
        allStreams[name] = this
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
            EpmlMessageType: STREAM_UPDATE_MESSAGE_TYPE,
            streamName: this._name
        })
    }

    emit (data) {
        this.targets.forEach(target => this._sendMessage(data, target))
    }
}
