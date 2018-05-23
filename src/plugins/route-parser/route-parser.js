class Route {
    constructor (route) {
        return route
    }
    parse (route) {
        return route
    }
}

const routeParser = {
    init (Epml) {
        Epml.prototype.routeParser = {
            Route
        }
    }
}

export default routeParser
