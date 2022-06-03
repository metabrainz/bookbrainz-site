import * as Boostrap from 'react-bootstrap';
import CoverTab from './cover-tab/cover-tab';
import React from 'react';
import SubmitSection from '../entity-editor/submission-section/submission-section';
import {UnifiedFormProps} from './interface/type';
import {connect} from 'react-redux';
import {filterIdentifierTypesByEntityType} from '../../common/helpers/utils';


const {Tabs, Tab} = Boostrap;
export function UnifiedForm(props:UnifiedFormProps) {
	const {identifierTypes, validators} = props;
	const [tabKey, setTabKey] = React.useState('cover');
	const editionIdentifierTypes = filterIdentifierTypesByEntityType(identifierTypes, 'edition');
	return (
		<div className="uf-main">
			<Tabs activeKey={tabKey} className="mb-3 uf-tab-header" id="controlled-tab" onSelect={setTabKey}>
				<Tab eventKey="cover" title="Cover">
					<CoverTab/>
				</Tab>
			</Tabs>
			<SubmitSection identifierTypes={editionIdentifierTypes} validate={validators && validators.edition}/>

		</div>);
}

function mapStateToProps(state, userprops) {
	return {};
}

function mapDispatchToProps(state) {
	return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(UnifiedForm);
