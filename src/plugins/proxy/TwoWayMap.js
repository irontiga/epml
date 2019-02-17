class TwoWayMap {
    constructor (map) {
        this._map = map || new Map()
        this._revMap = new Map()

        this._map.forEach((key, value) => {
            this._revMap.set(value, key)
        })
    }

    values () {
        return this._map.values()
    }

    entries () {
        return this._map.entries()
    }

    push (key, value) {
        this._map.set(key, value)
        this._revMap.set(value, key)
    }

    getByKey (key) {
        return this._map.get(key)
    }

    getByValue (value) {
        return this._revMap.get(value)
    }

    hasKey (key) {
        return this._map.has(key)
    }

    hasValue (value) {
        return this._revMap.has(value)
    }

    deleteByKey (key) {
        const value = this._map.get(key)
        this._map.delete(key)
        this._revMap.delete(value)
    }

    deleteByValue (value) {
        const key = this._revMap.get(value)
        this._map.delete(key)
        this._revMap.delete(value)
    }
}

export default TwoWayMap
