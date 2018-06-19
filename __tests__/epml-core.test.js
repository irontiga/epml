import Epml from '../src/EpmlCore/EpmlCore.js'

describe('Load Epml-core', () => {
    it('Checks that Epml loaded correctly', () => {
        expect.anything(Epml.registerPlugin)
    })
})
