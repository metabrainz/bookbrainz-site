import {Button, Col, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import IdentifierRow from './identifier-row';
import Immutable from 'immutable';
import React from 'react';
import {addIdentifierRow} from './actions';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {faPlus} from '@fortawesome/free-solid-svg-icons';


type IdentifierModalBodyStateProps = {
    identifiers: Immutable.Map<number, any>;
};
type IdentifierModalBodyDispatchProps = {
    onAddIdentifier: () => void
};
type IdentifierModalBodyOwnProps = {
    identifierTypes: Array<any>;
};
type IdentifierModalBodyProps = IdentifierModalBodyOwnProps & IdentifierModalBodyStateProps & IdentifierModalBodyDispatchProps;


export const IdentifierModalBody = ({identifiers, onAddIdentifier, identifierTypes}:IdentifierModalBodyProps) => {
	const noIdentifiersTextClass =
		classNames('text-center', {'d-none': identifiers.size});

	return (
		<>
			<div className={noIdentifiersTextClass}>
				<p className="text-muted">This entity has no identifiers</p>
			</div>
			<div>
				{
					identifiers.map((identifier, rowId) => (
						<IdentifierRow
							index={rowId}
							// eslint-disable-next-line react/no-array-index-key
							key={rowId}
							typeOptions={identifierTypes}
						/>
					)).toArray()
				}
			</div>
			<Row>
				<Col className="text-right" lg={{offset: 9, span: 3}}>
					<Button variant="success" onClick={onAddIdentifier}>
						<FontAwesomeIcon icon={faPlus}/>
						<span>&nbsp;Add identifier</span>
					</Button>
				</Col>
			</Row>
		</>);
};

function mapStateToProps(state) {
	return {
		identifiers: state.get('identifierEditor')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddIdentifier: () => dispatch(addIdentifierRow())
	};
}
export default connect<IdentifierModalBodyStateProps, IdentifierModalBodyDispatchProps>(mapStateToProps, mapDispatchToProps)(IdentifierModalBody);
