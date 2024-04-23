
import AliasFields from './alias-fields';
import AliasRow from './alias-row';
import Immutable from 'immutable';
import React from 'react';
import {Row} from 'react-bootstrap';
import classNames from 'classnames';
import {connect} from 'react-redux';


type AliasModalBodyStateProps = {
    aliases: Immutable.List<string>;
};

type AliasModalBodyOwnProps = {
    languageOptions?:any[],
};
type AliasModalBodyProps = AliasModalBodyStateProps & AliasModalBodyOwnProps;

export const AliasModalBody = ({aliases, languageOptions}:AliasModalBodyProps) => {
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
				<AliasFields
					index={0}
					// eslint-disable-next-line react/no-array-index-key
					key={`alias-row-${0}`}
					languageOptions={languageOptionsForDisplay}
				/>
			</Row>
		</>);
};

AliasModalBody.defaultProps = {
	languageOptions: []
};

function mapStateToProps(rootState) {
	return {
		aliases: rootState.get('aliasSection')
	};
}

export default connect<AliasModalBodyStateProps>(mapStateToProps, null)(AliasModalBody);
