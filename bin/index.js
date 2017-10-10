var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define("compose-reducers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function composeReducers(reducers) {
        return function (state, action) {
            return reducers.reduce(function (newState, reducer) {
                return reducer(newState, action);
            }, state);
        };
    }
    exports.composeReducers = composeReducers;
});
define("dynamic-middleware", ["require", "exports", "redux"], function (require, exports, _redux) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            var arr2 = Array(arr.length);
            for (var i = 0; i < arr.length; i++) {
                arr2[i] = arr[i];
            }
            return arr2;
        }
        else {
            return Array.from(arr);
        }
    }
    var dynamic = [];
    function dynamicMiddlewares(store) {
        return function (next) {
            return function (action) {
                var middlewareAPI = {
                    getState: store.getState,
                    dispatch: function dispatch(act) {
                        return store.dispatch(act);
                    }
                };
                var chain = dynamic.map(function (middleware) {
                    return middleware(middlewareAPI);
                });
                return _redux.compose.apply(undefined, _toConsumableArray(chain))(next)(action);
            };
        };
    }
    exports.dynamicMiddlewares = dynamicMiddlewares;
    function addMiddleware(middleware) {
        var _dynamic;
        dynamic = (_dynamic = dynamic).concat.apply(_dynamic, arguments);
    }
    exports.addMiddleware = addMiddleware;
    function removeMiddleware(middleware) {
        var index = dynamic.findIndex(function (d) {
            return d === middleware;
        });
        if (index === -1) {
            return;
        }
        dynamic = [].concat(_toConsumableArray(dynamic.slice(0, index)), _toConsumableArray(dynamic.slice(index + 1)));
    }
    exports.removeMiddleware = removeMiddleware;
    function resetMiddlewares() {
        dynamic = [];
    }
    exports.resetMiddlewares = resetMiddlewares;
});
define("epic-decorator", ["require", "exports", "redux-observable"], function (require, exports, redux_observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var METADATA_KEY = 'redux-observable-decorator-metadata';
    function Epic() {
        return function (target, propertyName) {
            if (!Reflect.hasOwnMetadata(METADATA_KEY, target)) {
                Reflect.defineMetadata(METADATA_KEY, [], target);
            }
            var epics = Reflect.getOwnMetadata(METADATA_KEY, target);
            var metadata = { propertyName: propertyName };
            Reflect.defineMetadata(METADATA_KEY, epics.concat([metadata]), target);
        };
    }
    exports.Epic = Epic;
    function getEpicsMetadata(instance) {
        var target = Object.getPrototypeOf(instance);
        if (!Reflect.hasOwnMetadata(METADATA_KEY, target)) {
            return [];
        }
        return Reflect.getOwnMetadata(METADATA_KEY, target);
    }
    exports.getEpicsMetadata = getEpicsMetadata;
    function isOptions() {
        var instanceOrOptions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            instanceOrOptions[_i] = arguments[_i];
        }
        var option = instanceOrOptions[instanceOrOptions.length - 1];
        var keys = option ? Object.keys(option) : [];
        return keys.indexOf('dependencies') >= 0 || keys.indexOf('adapter') >= 0;
    }
    function createEpics(epic) {
        var epicsOrOptions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            epicsOrOptions[_i - 1] = arguments[_i];
        }
        var instances;
        var options;
        if (isOptions.apply(void 0, epicsOrOptions)) {
            options = epicsOrOptions.slice(epicsOrOptions.length - 1, epicsOrOptions.length)[0];
        }
        instances = [epic].concat(epicsOrOptions);
        var epicsMetaData = instances
            .map(function (instance) { return getEpicsMetadata(instance)
            .map(function (_a) {
            var propertyName = _a.propertyName;
            return instance[propertyName];
        }); });
        var epics = [].concat.apply([], epicsMetaData);
        var rootEpic = redux_observable_1.combineEpics.apply(void 0, epics);
        return redux_observable_1.createEpicMiddleware(rootEpic, options);
    }
    exports.createEpics = createEpics;
});
define("store-base", ["require", "exports", "@angular-redux/store"], function (require, exports, store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StoreBase = /** @class */ (function () {
        function StoreBase(store) {
            this.store = store;
            this.dispatch = function (action) { return action; };
        }
        __decorate([
            store_1.dispatch(),
            __metadata("design:type", Object)
        ], StoreBase.prototype, "dispatch", void 0);
        return StoreBase;
    }());
    exports.StoreBase = StoreBase;
});
define("store-config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("store-module", ["require", "exports", "@angular/core", "@angular-redux/store", "dynamic-middleware", "@angular-redux/router", "redux", "epic-decorator"], function (require, exports, core_1, store_2, dynamic_middleware_1, router_1, redux_1, epic_decorator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var storeConfigs = {};
    var StoreModule = /** @class */ (function () {
        function StoreModule(injector, store, devTools) {
            this.injector = injector;
            this.store = store;
            this.devTools = devTools;
            var newConfig = this.reigsterModules();
            store.replaceReducer(function (x) { return newConfig.InitialState; }); // Trivial reducer that just returns the saved state.
            store.dispatch({ type: 'REHYDRATE' }); // Bogus action to trigger the reducer above.
            store.replaceReducer(newConfig.reducer);
            newConfig.epics.forEach(function (x) { return dynamic_middleware_1.addMiddleware(x); });
        }
        StoreModule_1 = StoreModule;
        StoreModule.Config = function (moduleName, config) {
            storeConfigs[moduleName] = config;
            return {
                ngModule: StoreModule_1
            };
        };
        StoreModule.prototype.reigsterModules = function () {
            var _this = this;
            var items = storeConfigs;
            // Initial State
            var initialState = {};
            var reducerMap = {};
            var epicClasses = [];
            for (var key in items) {
                if (!items.hasOwnProperty(key)) {
                    continue;
                }
                initialState[key] = items[key].InitialState;
                reducerMap[key] = items[key].reducer;
                epicClasses.push.apply(epicClasses, items[key].epics);
            }
            // Reducers
            var rootReducer = redux_1.combineReducers(__assign({ router: router_1.routerReducer }, reducerMap));
            // Epics
            var epicInstances = epicClasses.map(function (x) {
                return _this.injector.get(x);
            });
            var epics = epicInstances.map(function (x) { return epic_decorator_1.createEpics(x); });
            return {
                InitialState: initialState,
                reducer: rootReducer,
                epics: epics
            };
        };
        StoreModule = StoreModule_1 = __decorate([
            core_1.NgModule({
                imports: [store_2.NgReduxModule, router_1.NgReduxRouterModule]
            }),
            __metadata("design:paramtypes", [core_1.Injector,
                store_2.NgRedux,
                store_2.DevToolsExtension])
        ], StoreModule);
        return StoreModule;
        var StoreModule_1;
    }());
    exports.StoreModule = StoreModule;
});
//# sourceMappingURL=index.js.map