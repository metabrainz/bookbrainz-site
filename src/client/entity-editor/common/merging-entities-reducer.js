import Immutable from 'immutable';


function mergingEntitiesReducer(
	state = Immutable.List(),
	action
) {
	const {payload, type} = action;
	return state;
}

export default mergingEntitiesReducer;
