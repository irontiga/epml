import Epml from '../src/EpmlCore/EpmlCore.js'
import EpmlRequestPlugin from '../src/plugins/request/request.js'

describe('Load request', () => {
    it('Loads the request plugin', () => {
        expect.anything(Epml.registerPlugin(EpmlRequestPlugin).request)
    })
})
