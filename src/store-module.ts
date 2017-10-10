import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { NgReduxModule, NgRedux, DevToolsExtension } from "@angular-redux/store";
import { addMiddleware, dynamicMiddlewares } from "./dynamic-middleware";
import { StoreConfigs, StoreConfig } from "./store-config";
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';
import { combineReducers } from "redux";
import { createEpics } from "./epic-decorator";

declare var window: any;


@NgModule({
	imports: [NgReduxModule, NgReduxRouterModule]
})
export class StoreModule {

	private static storeConfigs: StoreConfigs = {};
	private static isConfigured: boolean;


	constructor(
		private injector: Injector,
		public store: NgRedux<any>,
		private devTools: DevToolsExtension,
	) {
		if (!StoreModule.isConfigured) {
			const config = this.reigsterModules();

			store.configureStore(
				config.reducer,
				config.InitialState,
				[dynamicMiddlewares, ...config.epics],
				devTools.isEnabled() ? [devTools.enhancer()] : []);

			if (window.devToolsExtension) {
				window.devToolsExtension.updateStore(store['_store']);
			}

			StoreModule.isConfigured = true;
		}
		else {
			const newConfig = this.reigsterModules();

			store.replaceReducer(x => newConfig.InitialState); // Trivial reducer that just returns the saved state.
			store.dispatch({ type: 'REHYDRATE' }); // Bogus action to trigger the reducer above.
			store.replaceReducer(newConfig.reducer);

			newConfig.epics.forEach(x => addMiddleware(x));
		}
	}

	static forChild(moduleName: string, config: StoreConfig): ModuleWithProviders | any {
		return {
			ngModule: StoreModule,
			hack: StoreModule.storeConfigs[moduleName] = config
		};
	}

	reigsterModules(): StoreConfig {
		const items = StoreModule.storeConfigs;

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
			return this.injector.get(x);
		});

		const epics = epicInstances.map(x => createEpics(x));


		return {
			InitialState: initialState,
			reducer: rootReducer,
			epics: epics
		};
	}
}
