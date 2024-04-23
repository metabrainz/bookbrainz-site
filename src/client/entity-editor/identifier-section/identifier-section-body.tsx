import IdentifierFields from './identifier-fields';
import IdentifierRow from './identifier-row';
import Immutable from 'immutable';
import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';


type IdentifierSectionBodyStateProps = {
    identifiers: Immutable.Map<number, any>;
};
type IdentifierSectionBodyOwnProps = {
    identifierTypes: Array<any>,
	isUnifiedForm: boolean
};
type IdentifierSectionBodyProps = IdentifierSectionBodyOwnProps & IdentifierSectionBodyStateProps;


export const IdentifierSectionBody = ({identifiers, identifierTypes, isUnifiedForm}:IdentifierSectionBodyProps) => {
	let textAlign = 'text-center';
	if (isUnifiedForm) {
		textAlign = 'text-start';
	}
	const noIdentifiersTextClass =
		classNames({textAlign}, {'d-none': identifiers.size});
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
							isUnifiedForm={isUnifiedForm}
							key={`identifier-row-${rowId}`}
							typeOptions={identifierTypes}
						/>
					)).toArray()
				}
			</div>
			<div>
				<IdentifierFields
					index={0}
					// eslint-disable-next-line react/no-array-index-key
					isUnifiedForm={isUnifiedForm}
					key={0}
					typeOptions={identifierTypes}
				/>
			</div>
		</>);
};

function mapStateToProps(state) {
	return {
		identifiers: state.get('identifierSection')
	};
}

export default connect<IdentifierSectionBodyStateProps>(mapStateToProps, null)(IdentifierSectionBody);
