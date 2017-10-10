import { Injectable, Injector } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { StoreConfig, StoreConfigs } from "./store-config.model";
import { combineReducers } from "redux";
import { createEpics } from "./epic-decorator";
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';
import { addMiddleware } from "dynamic-middleware";


export const storeConfigs: StoreConfigs = {};


@Injectable()
export class StoreConfigService {

	constructor(
		private injector: Injector,
		private store: NgRedux<any>
	) { }

	addModule(moduleName: string, initialState: any, reducer: any, epics?: any[]) {
		storeConfigs[moduleName] = {
			InitialState: initialState,
			reducer: reducer,
			epics: epics || []
		};

		const newConfig = reigsterModules(this.injector);

		this.store.replaceReducer(x => newConfig.InitialState); // Trivial reducer that just returns the saved state.
		this.store.dispatch({ type: 'REHYDRATE' }); // Bogus action to trigger the reducer above.
		this.store.replaceReducer(newConfig.reducer);

		newConfig.epics.forEach(x => addMiddleware(x));
	}
}


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
