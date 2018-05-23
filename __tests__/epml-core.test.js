import Epml from '../src/epml-core/epml-core.js'

describe('Load Epml-core', () => {
    it('Checks that Epml loaded correctly', () => {
        expect.anything(Epml.registerPlugin)
    })
})
