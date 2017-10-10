import { dispatch, NgRedux } from '@angular-redux/store';
import { Action } from "redux";

export abstract class StoreBase<TAction extends Action, TState>{

	constructor(private store: NgRedux<any>) {
	}

	@dispatch()
	dispatch = (action: TAction) => action

}
