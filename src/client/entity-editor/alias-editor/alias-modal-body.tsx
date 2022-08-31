import {Button, Col, Row} from 'react-bootstrap';
import AliasRow from './alias-row';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Immutable from 'immutable';
import React from 'react';
import {addAliasRow} from './actions';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {faPlus} from '@fortawesome/free-solid-svg-icons';


type AliasModalBodyStateProps = {
    aliases: Immutable.List<string>;
};
type AliasModalBodyDispatchProps = {
    onAddAlias: () => void;
};

type AliasModalBodyOwnProps = {
    languageOptions?:any[],
};
type AliasModalBodyProps = AliasModalBodyStateProps & AliasModalBodyDispatchProps & AliasModalBodyOwnProps;

export const AliasModalBody = ({aliases, onAddAlias, languageOptions}:AliasModalBodyProps) => {
	const noAliasesTextClass =
		classNames('text-center', {'d-none': aliases.size});
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		frequency: language.frequency,
		label: language.name,
		value: language.id
	}));
	return (
		<>
			<div className={noAliasesTextClass}>
				<p className="text-muted">This entity has no aliases</p>
			</div>
			<div>
				{
					aliases.map((_, rowId) => (
						<AliasRow
							index={rowId}
							// eslint-disable-next-line react/no-array-index-key
							key={`alias-row-${rowId}`}
							languageOptions={languageOptionsForDisplay}
						/>
					)).toArray()
				}
			</div>
			<Row>
				<Col className="text-right" lg={{offset: 9, span: 3}}>
					<Button variant="success" onClick={onAddAlias}>
						<FontAwesomeIcon icon={faPlus}/>
						<span>&nbsp;Add alias</span>
					</Button>
				</Col>
			</Row>
		</>);
};

AliasModalBody.defaultProps = {
	languageOptions: []
};

function mapDispatchToProps(dispatch) {
	return {
		onAddAlias: () => dispatch(addAliasRow())
	};
}

function mapStateToProps(rootState) {
	return {
		aliases: rootState.get('aliasEditor')
	};
}

export default connect<AliasModalBodyStateProps, AliasModalBodyDispatchProps>(mapStateToProps, mapDispatchToProps)(AliasModalBody);
