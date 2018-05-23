describe('Addition', () => {
    it('knows that 2 and 2 make 4', () => {
        expect(2 + 2).toBe(4)
    })
})

test('Inserts an iframe', () => {
    const frameID = 'myFrame'
    var ifrm = document.createElement('iframe')
    ifrm.setAttribute('src', 'https://wikipedia.org/')
    ifrm.id = frameID
    document.body.appendChild(ifrm)
    const frameElement = document.getElementById(frameID)

    console.log(frameElement.contentDocument.location)
    // expect(() => frameElement.contentDocument).toThrowError(DOMException) // Doesn't work because JSDOM doesn't seem to worry about CORS
})
