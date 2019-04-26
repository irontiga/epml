(function () {
    'use strict';

    /**
     * Base class for a target. Has checks in place to validate Target objects
     * @module Target
     */

    class Target {
        // // Need a static getter to check for inheritance...otherwise browser bundles can break
        // static get _isInheritedFromTargetBaseClass () {
        //     return true
        // }
        /**
            * Last step before sending data. Turns it into a string (obj->JSON)
            * @param {object} data
            */
        static prepareOutgoingData (data) {
            // console.log(data)
            return JSON.stringify(data)
        }

        constructor (source) {
            if (!source) throw new Error('Source must be spcified')

            // Not needed, uses type instead
            // if (!this.constructor.test) throw new Error('Class requires a static `test` method in order to check whether or not a source is compatible with the constructor')

            if (!this.constructor.type) throw new Error(`Type not defined`)

            if (!this.constructor.name) console.warn(`No name provided`);

            if (!this.constructor.description) console.warn('No description provided');

            if (!this.sendMessage) throw new Error('A new target requires a sendMessage method')
        }
    }

    const messageTypes = {};
    const targetTypes = {};
    // Change this to have id based targets, and therefore the ability to access any target anywhere always as long as you have it's id (don't need to pass objects around)
    // const allTargets = {}

    /**
     * Epml core. All plugins build off this
     * @constructor
     */
    class Epml {
        /**
         * Installs a plugin "globally". Every new and existing epml instance will have this plugin enabled
         * @param {object} plugin - Epml plugin
         * @param {object} options - Options config object
         */
        static registerPlugin (plugin, options) {
            plugin.init(Epml, options);
            return Epml
        }

        // /**
        //  * Adds a request handler function. Will be called whenever a message has a requestType corressponding to the supplied type
        //  * @param {string} type - Unique request identifier
        //  * @param {function} fn - Function to handle requests of this type
        //  */
        // static addRequestHandler (type, fn) {
        //     if (epmlRequestTypeHandlers[type]) throw new Error(`${type} is already defined`)

        //     epmlRequestTypeHandlers[type] = fn
        // }

        /**
         * @typedef TargetConstructor - Target constructor. Return a Target
         */
        // /**
        //  * Adds a new target contructor
        //  * @param {TargetConstructor} TargetConstructor - Has many methods...
        //  * @param {function} targetConstructor.isValidTarget - Takes a target and returns true if this constructor can handle this type of target
        //  */
        // static addTargetConstructor (TargetConstructor) {
        //     if (!(TargetConstructor instanceof Target)) throw new Error(`TargetConstructor must inherit from the Target base class.`)
        //     targetConstructors.push(TargetConstructor)
        // }

        static registerTargetType (type, targetConstructor) {
            if (type in targetTypes) throw new Error('Target type has already been registered')
            if (!(targetConstructor.prototype instanceof Target)) throw new Error('Target constructors must inherit from the Target base class')
            targetTypes[type] = targetConstructor;
            return Epml
        }

        static registerEpmlMessageType (type, fn) {
            messageTypes[type] = fn;
            return Epml
        }

        /**
         * Installs a plugin for only this instance
         * @param {object} plugin - Epml plugin
         */
        registerPlugin (plugin) {
            plugin.init(this);
            return this
        }

        /**
         * Takes data from an event and figures out what to do with it
         * @param {object} strData - String data received from something like event.data
         * @param {Target} target - Target object from which the message was received
         */
        static handleMessage (strData, target) {
            // Changes to targetID...and gets fetched through Epml.targets[targetID]...or something like that
            const data = Epml.prepareIncomingData(strData);
            // console.log(target)
            if ('EpmlMessageType' in data) {
                messageTypes[data.EpmlMessageType](data, target, this); // Reference to Epml
            }
            // Then send a response or whatever back with target.sendMessage(this.constructor.prepareOutgoingData(someData))
        }

        /**
        * Prepares data for processing. Take JSON string and return object
        * @param {string} strData - JSON data in string form
        */
        static prepareIncomingData (strData) {
            if (typeof strData !== 'string') {
                // If sending object is enabled then return the string...otherwise stringify and then parse (safeguard against code injections...whatever the word for that was)
                return strData
            }
            return JSON.parse(strData)
        }

        /**
         * Takes (a) target(s) and returns an array of target Objects
         * @param {Object|Object[]} targets
         * @returns {Object[]} - An array of target objects
         */
        static createTargets (targetSources) {
            if (!Array.isArray(targetSources)) targetSources = [targetSources];

            const targets = [];

            for (const targetSource of targetSources) {
                if (targetSource.allowObjects === undefined) targetSource.allowObjects = false;
                targets.push(...Epml.createTarget(targetSource));
            }

            return targets
        }

        /**
         * Takes a single target source and returns an array of target object
         * @param {any} targetSource - Can be any target source for which a targetConstructor has been installed
         * @return {Object} - Target object
         */
        static createTarget (targetSource) {
            /*
                {
                    source: myContentWindow / "my_channel" / "myWorker.js",
                    type: 'WINDOW' / 'BROADCAST_CHANNEL' / 'WORKER',
                    allowObjects: Bool
                }
            */

            // const TargetConstructor = targetConstructors.find(tCtor => tCtor.test(targetSource))
            // const newTarget = new TargetConstructor(targetSource)
            // console.log(targetTypes, targetTypes[targetSource.type])
            if (!targetTypes[targetSource.type]) {
                throw new Error(`Target type '${targetSource.type}' not registered`)
            }
            let newTargets = new targetTypes[targetSource.type](targetSource.source);
            if (!Array.isArray(newTargets)) newTargets = [newTargets];
            for (const newTarget of newTargets) {
                newTarget.allowObjects = targetSource.allowObjects;
            }
            return newTargets
        }

        /**
         * Creates a new Epml instance
         * @constructor
         * @param {Object|Object[]} targets - Target instantiation object or an array of them
         */
        constructor (targets) {
            this.targets = this.constructor.createTargets(targets);
        }
    }

    // https://gist.github.com/LeverOne/1308368
    var genUUID = (a, b) => { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-'); return b };

    // function () {
    //     return (1 + Math.random()).toString(36)
    // }

    // import Target from '../../EpmlCore/Target.js'

    const REQUEST_MESSAGE_TYPE = 'REQUEST';
    const REQUEST_RESPONSE_MESSAGE_TYPE = 'REQUEST_RESPONSE';

    /**
     * Epml request module. Wrapper for asynchronous requests and responses (routes)
     * @module plugins/request/request.js
     */
    // Maps a target to an array of routes
    const routeMap = new Map();

    const pendingRequests = {};

    /**
     * Request plugin
     */
    const requestPlugin = {
        init: (Epml, options) => {
            if (Epml.prototype.request) throw new Error('Epml.prototype.request is already defined')

            if (Epml.prototype.route) throw new Error(`Empl.prototype.route is already defined`)

            Epml.prototype.request = requestFn;

            Epml.prototype.route = createRoute;

            Epml.registerEpmlMessageType(REQUEST_MESSAGE_TYPE, requestHandler);
            Epml.registerEpmlMessageType(REQUEST_RESPONSE_MESSAGE_TYPE, requestResponseHandler);
        }
    };

    const requestFn = function (requestType, data, timeout) {
        // console.log(this)
        return Promise.all(this.targets.map(target => {
            const uuid = genUUID();

            const message = {
                EpmlMessageType: REQUEST_MESSAGE_TYPE,
                requestOrResponse: 'request',
                requestID: uuid,
                requestType,
                data // If data is undefined it's simply omitted :)
            };

            target.sendMessage(message);

            return new Promise((resolve, reject) => {
                // console.log('PROMISEEEE')
                let timeOutFn;
                if (timeout) {
                    timeOutFn = setTimeout(() => {
                        delete pendingRequests[uuid];
                        reject(new Error('Request timed out'));
                    }, timeout);
                }

                pendingRequests[uuid] = (...args) => {
                    if (timeOutFn) clearTimeout(timeOutFn);
                    resolve(...args);
                };
                // console.log(pendingRequests)
            })
        }))
            .then(responses => {
                // console.log(responses)
                // If an instance only has one target, don't return the array. That'd be weird
                if (this.targets.length === 1) return responses[0]
            })
    };

    function requestResponseHandler (data, target, Epml) {
        // console.log("REQUESSTTT", data, pendingRequests)
        // console.log('IN REQUESTHANDLER', pendingRequests, data)
        if (data.requestID in pendingRequests) {
            // console.log(data)
            // const parsedData = Epml.prepareIncomingData(data.data)
            const parsedData = data.data;
            // const parsedData = data.data
            pendingRequests[data.requestID](parsedData);
        } else {
            console.warn('requestID not found in pendingRequests');
        }
    }

    function requestHandler (data, target) {
        // console.log('REQUESTHANLDER')
        // console.log(routeMap)
        // console.log(data)
        // console.log(target)
        if (!routeMap.has(target)) {
            // Error, route does not exist
            console.warn(`Route does not exist - missing target`);
            return
        }
        const routes = routeMap.get(target);
        // console.log(data, routes)
        const route = routes[data.requestType];
        if (!route) {
            // Error, route does not exist
            console.warn('Route does not exist');
            return
        }
        // console.log('CALLING FN')
        route(data, target);
    }

    function createRoute (route, fn) {
        // console.log(`CREATING ROUTTTEEE "${route}"`)
        if (!this.routes) this.routes = {};

        if (this.routes[route]) return

        for (const target of this.targets) {
            if (!routeMap.has(target)) {
                routeMap.set(target, {});
            }

            const routes = routeMap.get(target);

            routes[route] = (data, target) => {
                // console.log('ROUTE FN CALLED', data)
                // User supllied route function. This will turn it into a promise if it isn't one, or it will leave it as one.
                Promise.resolve(fn(data))
                    .catch(err => {
                        if (err instanceof Error) return err.message
                        return err
                    }) // Still send errors you dumb fuck
                    .then((response) => {
                        // console.log(response)
                        // response = this.constructor.prepareOutgoingData(response)
                        // const preparedResponse = Target.prepareOutgoingData(response)
                        target.sendMessage({
                            data: response, // preparedResponse
                            EpmlMessageType: REQUEST_RESPONSE_MESSAGE_TYPE,
                            requestOrResponse: 'request',
                            requestID: data.requestID
                        });
                    });
            };
        }

        // console.log('hello')
    }

    /**
     * Requires epml-request plugin...or not
     */

    const READY_CHECK_INTERVAL = 15; // ms
    const READY_MESSAGE_TYPE = 'EPML_READY_STATE_CHECK';
    const READY_MESSAGE_RESPONSE_TYPE = 'EPML_READY_STATE_CHECK_RESPONSE';

    const pendingReadyRequests = {};

    const readyPlugin = {
        init: (Epml, options) => {
            // if (!Epml.prototype.request) throw new Error('Requires request plugin')

            if (Epml.prototype.ready) throw new Error('Epml.prototype.ready is already defined')
            if (Epml.prototype.imReady) throw new Error('Epml.prototype.imReady is already defined')

            Epml.prototype.ready = readyPrototype;
            Epml.prototype.resetReadyCheck = resetCheckReadyPrototype;
            Epml.prototype.imReady = imReadyPrototype;

            // Being asked if ready
            Epml.registerEpmlMessageType(READY_MESSAGE_TYPE, respondToReadyRequest);

            // Getting a response after polling for ready
            Epml.registerEpmlMessageType(READY_MESSAGE_RESPONSE_TYPE, readyResponseHandler);
        }
    };

    // This is the only part in the other "window"
    function respondToReadyRequest (data, target) {
        if (!target._i_am_ready) return
        target.sendMessage({
            EpmlMessageType: READY_MESSAGE_RESPONSE_TYPE,
            requestID: data.requestID
        });
    }

    function imReadyPrototype () {
        // console.log('I\'m ready called', this)
        for (const target of this.targets) {
            target._i_am_ready = true;
        }
        // this._ready_plugin.imReady = true
    }

    // myEpmlInstance.ready().then(...)
    function readyPrototype () {
        this._ready_plugin = this._ready_plugin || {};

        this._ready_plugin.pendingReadyResolves = this._ready_plugin.pendingReadyResolves ? this._ready_plugin.pendingReadyResolves : []; // Call resolves when all targets are ready

        if (!this._pending_ready_checking) {
            this._pending_ready_checking = true;
            checkReady.call(this, this.targets)
                .then(() => {
                    this._ready_plugin.pendingReadyResolves.forEach(resolve => resolve());
                });
        }

        return new Promise(resolve => {
            if (this._ready_plugin.isReady) {
                resolve();
            } else {
                this._ready_plugin.pendingReadyResolves.push(resolve);
            }
        })
    }

    function resetCheckReadyPrototype () {
        this._ready_plugin = this._ready_plugin || {};
        this._ready_plugin.isReady = false;
    }

    function checkReady (targets) {
        // console.log('Checking', targets)
        this._ready_plugin = this._ready_plugin || {};
        this._ready_plugin.pendingReadyResolves = [];

        return Promise.all(targets.map(target => {
            return new Promise((resolve, reject) => {
                const id = genUUID();
                // Send a message at an interval.
                const inteval = setInterval(() => {
                    // console.log('interval')
                    // , this, window.location
                    target.sendMessage({
                        EpmlMessageType: READY_MESSAGE_TYPE,
                        requestID: id
                    });
                }, READY_CHECK_INTERVAL);

                // Clear the interval and resolve the promise
                pendingReadyRequests[id] = () => {
                    // console.log('RESOLVING')
                    clearInterval(inteval);
                    resolve();
                };
            })
        })).then(() => {
            this._ready_plugin.isReady = true;
        })
    }

    // Sets ready for a SINGLE TARGET
    function readyResponseHandler (data, target) {
        // console.log('response')
        // console.log('==== THIS TARGET IS REEEEEAAADDDDYYY ====')
        // console.log(target)

        target._ready_plugin = target._ready_plugin || {};
        target._ready_plugin._is_ready = true;

        pendingReadyRequests[data.requestID]();
    }

    /**
     * Default plugins for Epml
     * @module
     */

    // Epml.registerPlugin(contentWindowsPlugin)
    Epml.registerPlugin(requestPlugin);
    Epml.registerPlugin(readyPlugin);

    const sourceTargetMap = new Map();

    /**
     * Can only take ONE iframe or popup as source
     */
    class WorkerTarget extends Target {
        static get sources () {
            return Array.from(sourceTargetMap.keys())
        }

        static get targets () {
            return Array.from(sourceTargetMap.values())
        }

        static getTargetFromSource (source) {
            return sourceTargetMap.get(source)
        }

        static hasTarget (source) {
            return sourceTargetMap.has(source)
        }

        static get type () {
            return 'WORKER'
        }

        static get name () {
            return 'Web/Service worker plugin'
        }

        static get description () {
            return `Allows Epml to communicate with web and service workers.`
        }

        static test (source) {
            if (typeof source !== 'object') return false
            // console.log('FOCUS FNS', source.focus === window.focus)

            return ((typeof WorkerGlobalScope !== 'undefined' && source instanceof WorkerGlobalScope) || source instanceof Worker)
        }

        isFrom (source) {
            //
        }

        constructor (source) {
            super(source);

            // if (source.contentWindow) source = source.contentWindow

            // If the source already has an existing target object, simply return it.
            if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

            if (!this.constructor.EpmlReference) throw new Error('No Epml(core) reference')

            if (!this.constructor.test(source)) throw new Error(`Source can not be used with target type '${this.constructor.type}'`)

            this._source = source;

            // sourceTargetMap.set(source, this)

            // And listen for messages
            // console.log(source)
            source.onmessage = event => {
                // console.log(event)
                // console.log(this)
                this.constructor.EpmlReference.handleMessage(event.data, this);
            };
            // targetWindows.push(source)
        }

        get source () {
            return this._source
        }

        sendMessage (message) {
            message = Target.prepareOutgoingData(message);
            this._source.postMessage(message, this._sourceOrigin);
        }
    }

    /**
     * Epml webworker plugin. Enables communication with web/service workers
     */
    var EpmlWorkerPlugin = {
        init: function (Epml) {
            // Adding the listener to the worker requires a reference to Epml for the handleMessage method
            WorkerTarget.EpmlReference = Epml;

            // Epml.addTargetConstructor(ContentWindowTarget)
            Epml.registerTargetType(WorkerTarget.type, WorkerTarget);
        }
    };

    // importScripts('../dist/epml.browser.js')
    // importScripts('../dist/plugins/workers/workers.browser.js')
    Epml.registerPlugin(EpmlWorkerPlugin);

    postMessage({});

    // console.log(self instanceof WorkerGlobalScope)

    const workerParentEpml = new Epml({type: 'WORKER', source: self});

    workerParentEpml.route('RandNum', async req => {
        return Math.random()
    });

    console.log('WORKER: ', workerParentEpml);

    // workerParentEpml.imReady()

    workerParentEpml.ready().then(() => {
        console.log('Worker\'s parent is ready ...frame1.html');
    });

}());
