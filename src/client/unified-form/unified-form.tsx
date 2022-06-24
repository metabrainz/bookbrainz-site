import * as Boostrap from 'react-bootstrap';
import {IdentifierType, UnifiedFormDispatchProps, UnifiedFormProps} from './interface/type';
import ContentTab from './content-tab/content-tab';
import CoverTab from './cover-tab/cover-tab';
import DetailTab from './detail-tab/detail-tab';
import NavButtons from './navbutton';
import React from 'react';
import SubmitSection from '../entity-editor/submission-section/submission-section';
import {connect} from 'react-redux';
import {filterIdentifierTypesByEntityType} from '../../common/helpers/utils';
import {submit} from '../entity-editor/submission-section/actions';


const {Tabs, Tab} = Boostrap;
function getUfValidator(validator) {
	return (state, identifierTypes, ...args) => {
		if (state.get('ISBN') && !state.getIn(['ISBN', 'type']) && state.getIn(['ISBN', 'value'], '').length > 0) {
			return false;
		}
		return validator(state, identifierTypes, ...args);
	};
}
export function UnifiedForm(props:UnifiedFormProps) {
	const {identifierTypes, validators, onSubmit} = props;
	const [tabKey, setTabKey] = React.useState('cover');
	const editionIdentifierTypes = filterIdentifierTypesByEntityType(identifierTypes, 'edition');
	const tabKeys = ['cover', 'content', 'detail'];
	const onNextHandler = React.useCallback(() => {
		const index = tabKeys.indexOf(tabKey);
		if (index >= 0 && index < tabKeys.length - 1) {
			setTabKey(tabKeys[index + 1]);
		}
	}, [tabKey]);
	const onBackHandler = React.useCallback(() => {
		const index = tabKeys.indexOf(tabKey);
		if (index > 0 && index < tabKeys.length) {
			setTabKey(tabKeys[index - 1]);
		}
	}, [tabKey]);
	return (
		<form className="uf-main" onSubmit={onSubmit}>
			<div className="uf-tab">
				<h4>Add Book</h4>
				<Tabs activeKey={tabKey} className="uf-tab-header" id="controlled-tab" onSelect={setTabKey}>
					<Tab eventKey="cover" title="Cover">
						<CoverTab {...props} identifierTypes={editionIdentifierTypes as IdentifierType[]}/>
					</Tab>
					<Tab eventKey="content" title="Contents">
						<ContentTab {...props}/>
					</Tab>
					<Tab eventKey="detail" title="Details">
						<DetailTab {...props}/>
					</Tab>
				</Tabs>
			</div>
			<NavButtons
				disableBack={tabKeys.indexOf(tabKey) === 0} disableNext={tabKeys.indexOf(tabKey) === tabKeys.length - 1}
				onBack={onBackHandler} onNext={onNextHandler}
			/>
			<SubmitSection isUf identifierTypes={editionIdentifierTypes} validate={validators && getUfValidator(validators.edition)}/>

		</form>
	);
}

function mapDispatchToProps(dispatch, {submissionUrl}) {
	return {
		onSubmit: (event:React.FormEvent) => {
			event.preventDefault();
			dispatch(submit(submissionUrl, true));
		}
	};
}

export default connect<null, UnifiedFormDispatchProps>(null, mapDispatchToProps)(UnifiedForm);
