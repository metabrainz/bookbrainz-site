import * as Boostrap from 'react-bootstrap';
import {IdentifierType, UnifiedFormDispatchProps, UnifiedFormOwnProps, UnifiedFormProps, UnifiedFormStateProps} from './interface/type';
import ContentTab from './content-tab/content-tab';
import CoverTab from './cover-tab/cover-tab';
import DetailTab from './detail-tab/detail-tab';
import NavButtons from './navbutton';
import React from 'react';
import SubmitSection from '../entity-editor/submission-section/submission-section';
import SummarySection from './submit-tab/summary';
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
	const {allIdentifierTypes, validator, onSubmit, formValid} = props;
	const [tabKey, setTabKey] = React.useState('cover');
	const editionIdentifierTypes = filterIdentifierTypesByEntityType(allIdentifierTypes, 'Edition');
	const editionValidator = validator && getUfValidator(validator);
	const tabKeys = ['cover', 'detail', 'content', 'submit'];
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
	const tabIndex = tabKeys.indexOf(tabKey);
	const disableNext = tabIndex === tabKeys.length - 1 || ((tabIndex === tabKeys.length - 2) && !formValid);
	const disableBack = tabIndex === 0;
	return (
		<form className="uf-main" onSubmit={onSubmit}>
			<div className="uf-tab">
				<h4>Add Book</h4>
				<Tabs activeKey={tabKey} className="uf-tab-header" id="controlled-tab" onSelect={setTabKey}>
					<Tab eventKey="cover" title="Cover">
						<CoverTab {...props} identifierTypes={editionIdentifierTypes as IdentifierType[]}/>
					</Tab>
					<Tab eventKey="detail" title="Details">
						<DetailTab {...props}/>
					</Tab>
					<Tab eventKey="content" title="Contents">
						<ContentTab {...props}/>
					</Tab>
					<Tab disabled={!formValid} eventKey="submit" title="Submit">
						<SummarySection/>
						<SubmitSection isUf formValid={formValid} identifierTypes={editionIdentifierTypes} validate={editionValidator}/>

					</Tab>
				</Tabs>
			</div>
			<NavButtons
				disableBack={disableBack} disableNext={disableNext}
				onBack={onBackHandler} onNext={onNextHandler}
			/>
		</form>
	);
}

function mapStateToProps(state, {validator, allIdentifierTypes}:UnifiedFormOwnProps) {
	const editionValidator = validator && getUfValidator(validator);
	const editionIdentifierTypes = filterIdentifierTypesByEntityType(allIdentifierTypes, 'Edition');
	return {
		formValid: editionValidator && editionValidator(state, editionIdentifierTypes, false, true)
	};
}
function mapDispatchToProps(dispatch, {submissionUrl}) {
	return {
		onSubmit: (event:React.FormEvent) => {
			event.preventDefault();
			dispatch(submit(submissionUrl, true));
		}
	};
}

export default connect<UnifiedFormStateProps, UnifiedFormDispatchProps>(mapStateToProps, mapDispatchToProps)(UnifiedForm);
