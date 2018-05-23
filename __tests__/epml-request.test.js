import Epml from '../src/epml-core/epml-core.js'
import EpmlRequestPlugin from '../src/plugins/request/request.js'

describe('Load request', () => {
    it('Loads the request plugin', () => {
        expect.anything(Epml.registerPlugin(EpmlRequestPlugin).request)
    })
})
