import {EntityModalBodyProps, EntityModalDispatchProps} from '../interface/type';
import AliasModalBody from '../../entity-editor/alias-editor/alias-modal-body';
// import {validateAliases, validateIdentifiers, validateNameSection} from '../../entity-editor/validators/common';
import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import IdentifierModalBody from '../../entity-editor/identifier-editor/identifier-modal-body';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import RelationshipSection from '../../entity-editor/relationship-editor/relationship-section';
import SingleAccordion from './single-accordion';
import SubmissionSection from '../../entity-editor/submission-section/submission-section';
import {connect} from 'react-redux';
import {omit} from 'lodash';
import {removeEmptyAliases} from '../../entity-editor/alias-editor/actions';
import {removeEmptyIdentifiers} from '../../entity-editor/identifier-editor/actions';
// import {validateAuthorSection} from '../../entity-editor/validators/author';
// import {validateEditionGroupSection} from '../../entity-editor/validators/edition-group';
// import {validateEditionSection} from '../../entity-editor/validators/edition';
// import {validatePublisherSection} from '../../entity-editor/validators/publisher';
// import {validateSeriesSection} from '../../entity-editor/validators/series';
// import {validateWorkSection} from '../../entity-editor/validators/work';

/* currently disabling validations on modal due to slow performance issues of the form. */

// const entitySectionValidators = {
// 	authorSection: validateAuthorSection,
// 	editionGroupSection: validateEditionGroupSection,
// 	editionSection: validateEditionSection,
// 	publisherSection: validatePublisherSection,
// 	seriesSection: validateSeriesSection,
// 	workSection: validateWorkSection
// };
function EntityModalBody({onModalSubmit, children, validate, onAliasClose, onIdentifierClose, ...rest}
	:EntityModalBodyProps) {
	const genericProps:any = omit(rest, ['allIdentifierTypes']);
	return (
		<form className="uf-modal-body" onSubmit={onModalSubmit}>
			<SingleAccordion defaultActive heading="Name" >
				<NameSection isModal {...rest}/>
			</SingleAccordion>
			<SingleAccordion defaultActive heading="Details">
				{
					React.cloneElement(
						React.Children.only(children),
						{...rest, isLeftAlign: true}
					)
				}
			</SingleAccordion>
			<SingleAccordion heading="Aliases" onToggle={onAliasClose}>
				<AliasModalBody {...genericProps}/>
			</SingleAccordion>
			<SingleAccordion heading="Identifiers" onToggle={onIdentifierClose}>
				<IdentifierModalBody {...rest}/>
			</SingleAccordion>
			<SingleAccordion heading="Relationships">
				<RelationshipSection {...genericProps}/>
			</SingleAccordion>
			<SingleAccordion heading="Annotation">
				<AnnotationSection {...rest}/>
			</SingleAccordion>
			<SubmissionSection {...rest} validate={validate} onSubmit={onModalSubmit}/>

		</form>
	);
}
EntityModalBody.defaultProps = {
	children: null
};
// function mapStateToProps(state:State, {entityType, identifierTypes}) {
// 	const nameSection = state.get('nameSection');
// 	const entitySection = `${camelCase(entityType)}Section`;
// 	return {
// 		isAliasEditorEmpty:	state.get('aliasEditor', {}).size === 0,
// 		isAliasEditorValid: validateAliases(state.get('aliasEditor', {})),
// 		isEntitySectionValid: entitySectionValidators[entitySection](state.get(entitySection)),
// 		isIdentifierEditorEmpty: state.get('identifierEditor', {}).size === 0,
// 		isIdentifierEditorValid: validateIdentifiers(state.get('identifierEditor', {}), identifierTypes),
// 		isNameSectionEmpty: !nameSection.get('name').length && !nameSection.get('sortName').length && !nameSection.get('language'),
// 		isNameSectionValid: validateNameSection(nameSection) &&
// 		 (!nameSection.get('exactMatches', [])?.length || nameSection.get('disambiguation').length > 0)
// 	};
// }
function mapDispatchToProps(dispatch) {
	return {
		onAliasClose: () => dispatch(removeEmptyAliases()),
		onIdentifierClose: () => dispatch(removeEmptyIdentifiers())

	};
}
export default connect<null, EntityModalDispatchProps>(null, mapDispatchToProps)(EntityModalBody);
