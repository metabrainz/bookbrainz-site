import * as Boostrap from 'react-bootstrap';
import {IdentifierType, State, UnifiedFormDispatchProps, UnifiedFormOwnProps, UnifiedFormProps, UnifiedFormStateProps} from './interface/type';
import {isCoverTabEmpty, validateCoverTab} from './validators/cover-tab';
import {isDetailTabEmpty, validateDetailTab} from './validators/detail-tab';
import ContentTab from './content-tab/content-tab';
import CoverTab from './cover-tab/cover-tab';
import DetailTab from './detail-tab/detail-tab';
import NavButtons from './navbutton';
import React from 'react';
import SubmitSection from '../entity-editor/submission-section/submission-section';
import SummarySection from './submit-tab/summary';
import ValidationLabel from '../entity-editor/common/validation-label';
import {connect} from 'react-redux';
import {convertMapToObject} from '../helpers/utils';
import createFilterOptions from 'react-select-fast-filter-options';
import {filterIdentifierTypesByEntityType} from '../../common/helpers/utils';
import {freezeObjects} from './common/freezed-objects';
import {getUfValidator} from './validators/base';
import {omit} from 'lodash';
import {submit} from '../entity-editor/submission-section/actions';


const {Tabs, Tab} = Boostrap;


export function UnifiedForm(props:UnifiedFormProps) {
	const {allIdentifierTypes, validator, onSubmit, formValid,
		languageOptions, contentTabEmpty, coverTabValid, coverTabEmpty, detailTabValid, detailTabEmpty} = props;
	const rest = omit(props, ['contentTabEmpty', 'coverTabValid', 'coverTabEmpty', 'detailTabValid', 'formValid', 'detailTabEmpty']);
	React.useMemo(() => {
		// without this check, it would cause undefined behaviour
		if (!freezeObjects.filterOptions) {
			const options = languageOptions.map((language) => ({
				frequency: language.frequency,
				label: language.name,
				value: language.id
			}));
			freezeObjects.filterOptions = createFilterOptions({options});
			Object.freeze(freezeObjects);
		}
	}, []);
	const [tabKey, setTabKey] = React.useState('cover');
	const editionIdentifierTypes = React.useMemo(() => filterIdentifierTypesByEntityType(allIdentifierTypes, 'Edition'), []);
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
					<Tab eventKey="cover" title={<ValidationLabel hideIcon empty={coverTabEmpty} error={!coverTabValid}>Cover</ValidationLabel>}>
						<CoverTab {...rest} identifierTypes={editionIdentifierTypes as IdentifierType[]}/>
					</Tab>
					<Tab eventKey="detail" title={<ValidationLabel hideIcon empty={detailTabEmpty} error={!detailTabValid}>Details</ValidationLabel>}>
						<DetailTab {...rest}/>
					</Tab>
					<Tab eventKey="content" title={<ValidationLabel hideIcon empty={contentTabEmpty}>Contents</ValidationLabel>}>
						<ContentTab {...rest}/>
					</Tab>
					<Tab disabled={!formValid} eventKey="submit" title="Submit">
						<SummarySection languageOptions={languageOptions}/>
						<SubmitSection isUnifiedForm formValid={formValid} identifierTypes={editionIdentifierTypes} validate={editionValidator}/>

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

function mapStateToProps(state:State, {allIdentifierTypes}:UnifiedFormOwnProps) {
	const jsonState = convertMapToObject(state);
	const editionIdentifierTypes = filterIdentifierTypesByEntityType(allIdentifierTypes, 'Edition');
	const coverTabEmpty = isCoverTabEmpty(jsonState);
	const coverTabValid = !coverTabEmpty && validateCoverTab(jsonState, editionIdentifierTypes);
	const detailTabValid = validateDetailTab(jsonState);
	return {
		contentTabEmpty: state.get('Works').size === 0,
		coverTabEmpty,
		coverTabValid,
		detailTabEmpty: isDetailTabEmpty(jsonState),
		detailTabValid,
		formValid: coverTabValid && detailTabValid
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
