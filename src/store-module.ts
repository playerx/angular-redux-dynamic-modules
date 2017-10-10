import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { NgReduxModule, NgRedux, DevToolsExtension } from "@angular-redux/store";
import { addMiddleware, dynamicMiddlewares } from "./dynamic-middleware";
import { StoreConfigs, StoreConfig } from "./store-config.model";
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';
import { combineReducers } from "redux";
import { createEpics } from "./epic-decorator";
import { StoreConfigService, reigsterModules } from "./store-config.service";

declare var window: any;


@NgModule({
	imports: [NgReduxModule, NgReduxRouterModule],
	providers: [StoreConfigService]
})
export class StoreModule {

	constructor(
		injector: Injector,
		store: NgRedux<any>,
		devTools: DevToolsExtension,
	) {
		const config = reigsterModules(injector);

		const newInitialState = config.InitialState;
		const mergedState = { ...store.getState(), newInitialState };

		store.configureStore(
			config.reducer,
			mergedState,
			[dynamicMiddlewares, ...config.epics],
			devTools.isEnabled() ? [devTools.enhancer()] : []);

		if (window.devToolsExtension) {
			window.devToolsExtension.updateStore(store['_store']);
		}
	}
}

