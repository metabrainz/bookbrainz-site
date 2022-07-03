// import * as Bootstrap from 'react-bootstrap';
import {Accordion, Card} from 'react-bootstrap';
import {EntityModalBodyProps, EntityModalDispatchProps} from '../interface/type';
import AliasModalBody from '../../entity-editor/alias-editor/alias-modal-body';
import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import IdentifierModalBody from '../../entity-editor/identifier-editor/identifier-modal-body';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import RelationshipSection from '../../entity-editor/relationship-editor/relationship-section';
import SubmissionSection from '../../entity-editor/submission-section/submission-section';
import {connect} from 'react-redux';
import {removeEmptyAliases} from '../../entity-editor/alias-editor/actions';
import {removeEmptyIdentifiers} from '../../entity-editor/identifier-editor/actions';


function EntityModalBody({onModalSubmit, children, validate, onAliasClose, onIdentifierClose, ...rest}:EntityModalBodyProps) {
	return (
		<form onSubmit={onModalSubmit}>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Basic
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<NameSection isModal {...rest}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0" onClick={onAliasClose}>Aliases
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<AliasModalBody {...rest}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0" onClick={onIdentifierClose}>Identifiers
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<IdentifierModalBody {...rest}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Details
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							{
								React.cloneElement(
									React.Children.only(children),
									{...rest, isLeftAlign: true}
								)
							}
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Relationships
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<RelationshipSection {...rest}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Annotation
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<AnnotationSection {...rest}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<SubmissionSection {...rest} validate={validate} onSubmit={onModalSubmit}/>

		</form>
	);
}
EntityModalBody.defaultProps = {
	children: null
};
function mapDispatchToProps(dispatch) {
	return {
		onAliasClose: () => dispatch(removeEmptyAliases()),
		onIdentifierClose: () => dispatch(removeEmptyIdentifiers())

	};
}
export default connect<null, EntityModalDispatchProps>(null, mapDispatchToProps)(EntityModalBody);
