import React from 'react';
import {connect} from 'react-redux';


export function Cover(props) {
	return <div>Cover</div>;
}

function mapStateToProps(state) {
	return {};
}

function mapDispatchToProps(state) {
	return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Cover);
