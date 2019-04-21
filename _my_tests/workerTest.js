import Epml from '../src/Epml_core.js'
import EpmlWorkerPlugin from '../src/plugins/workers/workers.js'
// importScripts('../dist/epml.browser.js')
// importScripts('../dist/plugins/workers/workers.browser.js')
Epml.registerPlugin(EpmlWorkerPlugin)

postMessage({})

// console.log(self instanceof WorkerGlobalScope)

const workerParentEpml = new Epml({type: 'WORKER', source: self})

workerParentEpml.route('RandNum', async req => {
    return Math.random()
})

console.log('WORKER: ', workerParentEpml)

// workerParentEpml.imReady()

workerParentEpml.ready().then(() => {
    console.log('Worker\'s parent is ready ...frame1.html')
})
