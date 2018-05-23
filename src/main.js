/**
 * Default plugins for Epml
 * @module
 */
import Epml from './EpmlCore/EpmlCore.js'
import contentWindowsPlugin from './plugins/contentWindows/contentWindows.js'
import requestPlugin from './plugins/request/request.js'

Epml.registerPlugin(contentWindowsPlugin)
Epml.registerPlugin(requestPlugin)

export default Epml
