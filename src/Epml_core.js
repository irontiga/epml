/**
 * Default plugins for Epml
 * @module
 */
import Epml from './EpmlCore/Epml.js'
// import contentWindowsPlugin from './plugins/contentWindows/contentWindows.js'
import requestPlugin from './plugins/request/request.js'
import readyPlugin from './plugins/ready/ready.js'

// Epml.registerPlugin(contentWindowsPlugin)
Epml.registerPlugin(requestPlugin)
Epml.registerPlugin(readyPlugin)

export default Epml
