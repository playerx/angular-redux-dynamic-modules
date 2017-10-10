export function composeReducers(reducers: [any]) {
	return (state, action) =>
		reducers.reduce((newState, reducer) =>
			reducer(newState, action), state);
}
