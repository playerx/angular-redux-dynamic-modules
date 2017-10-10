import * as _redux from 'redux';

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        const arr2 = Array(arr.length);

        for (let i = 0; i < arr.length; i++) {
            arr2[i] = arr[i];
        }

        return arr2;
    } else {
        return Array.from(arr);
    }
}

let dynamic = [];

export function dynamicMiddlewares(store) {
    return function (next) {
        return function (action) {
            const middlewareAPI = {
                getState: store.getState,
                dispatch: function dispatch(act) {
                    return store.dispatch(act);
                }
            };
            const chain = dynamic.map(function (middleware) {
                return middleware(middlewareAPI);
            });
            return _redux.compose.apply(undefined, _toConsumableArray(chain))(next)(action);
        };
    };
}

export function addMiddleware(middleware) {
    let _dynamic;
    dynamic = (_dynamic = dynamic).concat.apply(_dynamic, arguments);
}

export function removeMiddleware(middleware) {
    const index = dynamic.findIndex(function (d) {
        return d === middleware;
    });
    if (index === -1) { return; }

    dynamic = [].concat(_toConsumableArray(dynamic.slice(0, index)), _toConsumableArray(dynamic.slice(index + 1)));
}

export function resetMiddlewares() {
    dynamic = [];
}
