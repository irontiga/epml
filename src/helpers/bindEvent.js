// IE8 event listener support...probably going to be pointless in the end
export default function bindEvent (element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false)
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler)
    } else {
        throw new Error('Could not bind event.')
    }
}
