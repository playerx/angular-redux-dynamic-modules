import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { NgReduxModule, NgRedux, DevToolsExtension } from "@angular-redux/store";
import { StoreConfigs, StoreConfig } from "./store-config.model";
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';
import { combineReducers } from "redux";
import { createEpics } from "./epic-decorator";
import { StoreConfigService, reigsterModules, dynamicEpicMiddleware } from "./store-config.service";
import { Dispatcher } from "./dispatcher";

declare var window: any;



@NgModule({
	imports: [NgReduxModule, NgReduxRouterModule],
	providers: [StoreConfigService, Dispatcher]
})
export class StoreModule {

	constructor(
		store: NgRedux<any>,
		devTools: DevToolsExtension,
	) {
		const config = reigsterModules();

		store.configureStore(
			config.reducer,
			config.InitialState,
			[dynamicEpicMiddleware, ...config.epics],
			devTools.isEnabled() ? [devTools.enhancer()] : []);

		if (window.devToolsExtension) {
			window.devToolsExtension.updateStore(store['_store']);
		}
	}
}

