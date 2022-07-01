// import * as Bootstrap from 'react-bootstrap';
import {Accordion, Card} from 'react-bootstrap';
import AliasModalBody from '../../entity-editor/alias-editor/alias-modal-body';
import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import IdentifierModalBody from '../../entity-editor/identifier-editor/identifier-modal-body';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import RelationshipSection from '../../entity-editor/relationship-editor/relationship-section';
import SubmissionSection from '../../entity-editor/submission-section/submission-section';


type EntityModalBodyOwnProps = {
    onModalSubmit:(e)=>unknown,
    entityType:string,
	validate:(arg)=>unknown
	children?: React.ReactElement
};
type EntityModalBodyProps = EntityModalBodyOwnProps;

function EntityModalBody({onModalSubmit, children, validate, ...rest}:EntityModalBodyProps) {
	const [menuPortalTarget, setMenuPortalTarget] = React.useState(null);
	React.useEffect(() => {
		// FIXME: need better way to scrolling issue in react select menu https://github.com/JedWatson/react-select/issues/4088
		setMenuPortalTarget(document.body);
	}, []);
	return (
		<form onSubmit={onModalSubmit}>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Basic
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<NameSection {...rest}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Aliases
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
					<Accordion.Toggle as={Card.Header} eventKey="0">Identifiers
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
									{...rest, isLeftAlign: true, menuPortalTarget}
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
export default EntityModalBody;
