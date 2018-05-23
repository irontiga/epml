# epml
An Extensible PostMessage Library


Planned features:
 - Plugin system, allowing Wimp to be split up into the following modules:
   - **wimp-core** - Duh. Doesn't do much on it's own. Has the basic request features built in...or should that be a seperate plugin
   - **wimp-iframes** - Allows wimp to communicate with iframes with popup windows
   - **wimp-broadcast-channel** - Allows wimp to communicate through broadcast channels
   - **wimp-workers** - Allows wimp to communicate to/from web workers
   - **wimp-streams** - Adds streams...i.e. websocket connections to Wimp
   - **wimp-proxy** - Allows routes to be proxied between windows and frames. An alternative to broadcast channel when communicating cross-origin
   - **wimp-server** - Possible future improvement. Add support for communicating with a node server. This could look like using wimp to proxy cross origin domains to a server that doesn't allow cors. Might be overkill...but then should also be a light plugin.
   - _**wimp-requests**_ - Maybe...makes simple requests and routes possible...i.e. HTTP GET
   - **wimp-encrypt** - Publickey cryptography implementation to make communication between frames private
 - Fully ES6...supporting async functions for routes, and getting rid of callback support for things like requests. 
 - Advanced routing, i.e. allowing for routes such as `accounts/:accountID`
 - _Hapijs inspiration_ - Take route objects such as in hapi, as below. This could allow for route plugins, who knows
 ```javascript
 {
 	route: "account/:accountID",
    handler: async request => {
    	return db.get(request.accountID)
    }
 }```
 