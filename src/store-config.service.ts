import { Injectable, Injector } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { StoreConfig, StoreConfigs } from "./store-config.model";
import { Action, combineReducers } from "redux";
import { createEpics } from "./epic-decorator";
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';
import { combineEpics, createEpicMiddleware, EpicMiddleware } from "redux-observable";

export const storeConfigs: StoreConfigs = {};

export const dynamicEpicMiddleware = createEpicMiddleware(combineEpics(...[]));


@Injectable()
export class StoreConfigService {

	ActionTypes = {
		ModuleAdd: '[StoreConfig] Module Add'
	}

	constructor(private store: NgRedux<any>) { }

	addModule(moduleName: string, initialState: any, reducer: any, epics?: any[]) {
		storeConfigs[moduleName] = {
			InitialState: initialState,
			reducer: reducer,
			epics: epics || []
		};

		const newConfig = reigsterModules();

		const newInitialState = newConfig.InitialState;
		const mergedState = { ...this.store.getState(), newInitialState };

		const newEpic = combineEpics(...newConfig.epics);
		dynamicEpicMiddleware.replaceEpic(newEpic);

		this.store.replaceReducer(x => mergedState); // Trivial reducer that just returns the saved state.
		this.store.dispatch({ type: this.ActionTypes.ModuleAdd, payload: moduleName }); // Bogus action to trigger the reducer above.
		this.store.replaceReducer(newConfig.reducer);
	}
}


export function reigsterModules(): StoreConfig {
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
	const epicInstances = epicClasses
	// 	.map(x => {
	// 	return injector.get(x);
	// });

	const epics = epicInstances.map(x => createEpics(x)).reduce((a, b) => a.concat(b), []);


	return {
		InitialState: initialState,
		reducer: rootReducer,
		epics: epics
	};
}
