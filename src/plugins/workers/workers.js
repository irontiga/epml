'use strict'

// import bindEvent from '../../helpers/bindEvent.js'
import WorkerTarget from './WorkerTarget.js'
/**
 * Epml webworker plugin. Enables communication with web/service workers
 */
export default {
    init: function (Epml) {
        // Adding the listener to the worker requires a reference to Epml for the handleMessage method
        WorkerTarget.EpmlReference = Epml

        // Epml.addTargetConstructor(ContentWindowTarget)
        Epml.registerTargetType(WorkerTarget.type, WorkerTarget)
    }
}
