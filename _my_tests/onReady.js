function onReady (fn) {
    if (document.readyState === 'loading') { // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', fn())
    } else { // `DOMContentLoaded` has already fired
        fn()
    }
}

export default onReady