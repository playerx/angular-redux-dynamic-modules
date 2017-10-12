import { Injectable } from "@angular/core";
import { Action } from "redux";
import { NgRedux } from "@angular-redux/store/lib/src";


@Injectable()
export class Dispatcher<TAction extends Action> {
	constructor(private redux: NgRedux<any>) {
	}

	dispatch(action: TAction) {
		return this.redux.dispatch(action);
	}
}
