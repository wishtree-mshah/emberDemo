export function Memoize(autoHashOrHashFn) {
    return (target, propertyKey, descriptor) => {
        if (descriptor.value != null) {
            descriptor.value = getNewFunction(descriptor.value, autoHashOrHashFn);
        }
        else if (descriptor.get != null) {
            descriptor.get = getNewFunction(descriptor.get, autoHashOrHashFn);
        }
        else {
            throw 'Only put a Memoize() decorator on a method or get accessor.';
        }
    };
}
let counter = 0;
function getNewFunction(originalMethod, autoHashOrHashFn) {
    const identifier = ++counter;
    return function (...args) {
        const propValName = `__memoized_value_${identifier}`;
        const propMapName = `__memoized_map_${identifier}`;
        let returnedValue;
        if (autoHashOrHashFn || args.length > 0) {
            if (!this.hasOwnProperty(propMapName)) {
                Object.defineProperty(this, propMapName, {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: new Map()
                });
            }
            let myMap = this[propMapName];
            let hashKey;
            if (autoHashOrHashFn === true) {
                hashKey = args.map(a => a.toString()).join('!');
            }
            else if (autoHashOrHashFn) {
                hashKey = autoHashOrHashFn.apply(this, args);
            }
            else {
                hashKey = args[0];
            }
            if (myMap.has(hashKey)) {
                returnedValue = myMap.get(hashKey);
            }
            else {
                returnedValue = originalMethod.apply(this, args);
                myMap.set(hashKey, returnedValue);
            }
        }
        else {
            if (this.hasOwnProperty(propValName)) {
                returnedValue = this[propValName];
            }
            else {
                returnedValue = originalMethod.apply(this, args);
                Object.defineProperty(this, propValName, {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: returnedValue
                });
            }
        }
        return returnedValue;
    };
}
//# sourceMappingURL=memoize-decorator.js.map