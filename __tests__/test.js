import Epml from '../src/EpmlCore/EpmlCore.js'
import contentWindowPlugin from '../src/plugins/contentWindows/contentWindows.js'
import requestPlugin from '../src/plugins/request/request.js'

Epml.registerPlugin(contentWindowPlugin)
Epml.registerPlugin(requestPlugin)

let frameEpml, frameElement

describe('Create iframe EPML', () => {
    const frameID = 'myFrame'
    var ifrm = document.createElement('iframe')
    ifrm.setAttribute('src', 'https://wikipedia.org/')
    ifrm.id = frameID
    document.body.appendChild(ifrm)
    frameElement = document.getElementById(frameID)
    frameEpml = new Epml({type: 'WINDOW', source: frameElement.contentWindow})
    expect(frameEpml.targets[0].source).toBe(frameElement.contentWindow)
})

describe('Time request', async () => {
    // await
})

describe('Addition', () => {
    it('knows that 2 and 2 make 4', () => {
        expect(2 + 2).toBe(4)
    })
})

test('Inserts an iframe', () => {
    console.log(frameElement.contentDocument.location)
    // expect(() => frameElement.contentDocument).toThrowError(DOMException) // Doesn't work because JSDOM doesn't seem to worry about CORS
})
