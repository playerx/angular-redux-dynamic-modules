import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { NgReduxModule, NgRedux, DevToolsExtension } from "@angular-redux/store";
import { addMiddleware, dynamicMiddlewares } from "./dynamic-middleware";
import { StoreConfigs, StoreConfig } from "./store-config";
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';
import { combineReducers } from "redux";
import { createEpics } from "./epic-decorator";

declare var window: any;

export const storeConfigs: StoreConfigs = {};

export function reigsterModules(injector): StoreConfig {
	const items = storeConfigs;

	// Initial State
	const initialState = {};
	const reducerMap = {};
	const epicClasses = [];

	for (const key in items) {
		if (!items.hasOwnProperty(key)) { continue; }

		initialState[key] = items[key].InitialState;
		reducerMap[key] = items[key].reducer;
		epicClasses.push(...items[key].epics);
	}

	// Reducers
	const rootReducer = combineReducers({
		router: routerReducer,
		...reducerMap
	});

	// Epics
	const epicInstances = epicClasses.map(x => {
		return injector.get(x);
	});

	const epics = epicInstances.map(x => createEpics(x));


	return {
		InitialState: initialState,
		reducer: rootReducer,
		epics: epics
	};
}



@NgModule({
	imports: [NgReduxModule, NgReduxRouterModule]
})
export class RootStoreModule {

	constructor(
		injector: Injector,
		store: NgRedux<any>,
		devTools: DevToolsExtension,
	) {
		const config = reigsterModules(injector);

		store.configureStore(
			config.reducer,
			config.InitialState,
			[dynamicMiddlewares, ...config.epics],
			devTools.isEnabled() ? [devTools.enhancer()] : []);

		if (window.devToolsExtension) {
			window.devToolsExtension.updateStore(store['_store']);
		}
	}

	static forChild(moduleName: string, config: StoreConfig): ModuleWithProviders | any {
		return {
			ngModule: StoreModule,
			hack: (storeConfigs[moduleName] = config)
		};
	}
}


@NgModule({
	imports: [NgReduxModule, NgReduxRouterModule]
})
export class StoreModule {

	constructor(
		injector: Injector,
		store: NgRedux<any>,
		devTools: DevToolsExtension,
	) {
		const newConfig = reigsterModules(injector);

		store.replaceReducer(x => newConfig.InitialState); // Trivial reducer that just returns the saved state.
		store.dispatch({ type: 'REHYDRATE' }); // Bogus action to trigger the reducer above.
		store.replaceReducer(newConfig.reducer);

		newConfig.epics.forEach(x => addMiddleware(x));
	}

	static forChild(moduleName: string, config: StoreConfig): ModuleWithProviders | any {
		return {
			ngModule: StoreModule,
			hack: (storeConfigs[moduleName] = config)
		};
	}
}
