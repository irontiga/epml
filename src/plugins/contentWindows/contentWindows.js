'use strict'

import bindEvent from '../../helpers/bindEvent.js'
import ContentWindowTarget from './ContentWindowTarget.js'
/**
 * Epml content windows plugin. Enables communication with iframes and popup windows
 */
export default {
    init: function (Epml) {
        // const proto = Epml.prototype

        bindEvent(window, 'message', event => {
            console.log(event)
            if (!ContentWindowTarget.hasTarget(event.source)) return
            Epml.handleMessage(event.data, ContentWindowTarget.getTarget(event.source))
            // Epml.handleMessage(event.data, event.source, message => {
            //     event.source.postMessage(message, event.origin)
            // })
        })

        // Epml.addTargetConstructor(ContentWindowTarget)
        Epml.registerTargetType('WINDOW', ContentWindowTarget)

        // Epml.addTargetHandler({
        //     targetType: 'WINDOW', // Unique type for each target type
        //     name: 'Content window',
        //     description: 'Allows Epml to communicate with iframes and popup windows',
        //     isMatchingTargetSource: function (source) {
        //         if (typeof source !== 'object') return false

        //         source = source.contentWindow || source
        //     },
        //     createTarget: function (source) {
        //         targetWindows.push({
        //             source,
        //             eventIsFromSource: function (event) {
        //                 if (event.source === source) return true
        //                 return false
        //             }
        //         })
        //         return {
        //             sendMessage: function (data) {
        //                 return source.postMessage(data, source.origin)
        //             }
        //         }
        //     }
        // })
    }
}
