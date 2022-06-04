import * as Boostrap from 'react-bootstrap';
import {IdentifierType, UnifiedFormProps} from './interface/type';
import ContentTab from './content-tab/content-tab';
import CoverTab from './cover-tab/cover-tab';
import DetailTab from './detail-tab/detail-tab';
import React from 'react';
import SubmitSection from '../entity-editor/submission-section/submission-section';
import {connect} from 'react-redux';
import {filterIdentifierTypesByEntityType} from '../../common/helpers/utils';
import {submit} from '../entity-editor/submission-section/actions';


const {Tabs, Tab} = Boostrap;
function getUfValidator(validator) {
	return (state, identifierTypes) => {
		if (state.get('ISBN') && !state.getIn(['ISBN', 'type']) && state.getIn(['ISBN', 'value'], '').length > 0) {
			return false;
		}
		return validator(state, identifierTypes);
	};
}
export function UnifiedForm(props:UnifiedFormProps) {
	const {identifierTypes, validators, onSubmit} = props;
	const [tabKey, setTabKey] = React.useState('cover');
	const editionIdentifierTypes = filterIdentifierTypesByEntityType(identifierTypes, 'edition');
	return (
		<form className="uf-main" onSubmit={onSubmit}>
			<div className="uf-tab">
				<h4>Create Book</h4>
				<Tabs activeKey={tabKey} className="uf-tab-header" id="controlled-tab" onSelect={setTabKey}>
					<Tab eventKey="cover" title="Cover">
						<CoverTab {...props} identifierTypes={editionIdentifierTypes as IdentifierType[]}/>
					</Tab>
					<Tab eventKey="content" title="Contents">
						<ContentTab/>
					</Tab>
					<Tab eventKey="detail" title="Details">
						<DetailTab/>
					</Tab>
				</Tabs>
			</div>
			<SubmitSection identifierTypes={editionIdentifierTypes} validate={validators && getUfValidator(validators.edition)}/>

		</form>
	);
}

function mapDispatchToProps(dispatch, {submissionUrl}) {
	return {
		onSubmit: (event:React.FormEvent) => {
			event.preventDefault();
			dispatch(submit(submissionUrl));
		}
	};
}

export default connect(null, mapDispatchToProps)(UnifiedForm);
