wimp looks like:
```javascript
{
    registerPlugin(plugin){
        plugin.init(Wimp)
    }

    addRequestType(type, fn){
        requestTypes[type] = fn
    }

    addMethod(name, fn){
        Wimp.prototype[name] = fn
    }
    addEventResponseType(type){
        this._eventResponseTypes.push(type)
    }
    
    // Handler function for new messages. Gets passed a data object
    message(event, data){
        let responseType = this._eventResponseTypes.find(type => type.check(event))
    }
}
```

A plugin 
```javascript
{
    init(w){
        // Streams ing plugin
        w.addRequestType("streamMessage", data => {

        })
        w.addMethod("createStream", (streamName, options, joinFn) => {

        })
        // Webworker plugin
        w.addMethod("worker", (workerInstance) => {
            workerInstance.onMessage(w.message)

            w.targets.push({
                postMessage: data => {
                    workInstance.postMessage(data)
                }
            })
        })

        w.addEventResponseType({
            name: "workerResponse",
            check: event => {
                // Return Bool
            },
            respond: (event, data) => {
                event.srcElement.postMessage(data) // I think...
            }
        })
    }
}
```