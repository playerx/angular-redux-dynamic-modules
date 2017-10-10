import { dispatch, NgRedux } from '@angular-redux/store';
import { Action } from "redux";

export abstract class ActionsBase<TAction extends Action>{

	@dispatch()
	dispatch = (action: TAction) => action

}
