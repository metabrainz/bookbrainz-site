import React from 'react';
import {connect} from 'react-redux';


export function UnifiedForm(props) {
	return <div>UnifiedForm</div>;
}

function mapStateToProps(state, userprops) {
	return {};
}

function mapDispatchToProps(state) {
	return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(UnifiedForm);
