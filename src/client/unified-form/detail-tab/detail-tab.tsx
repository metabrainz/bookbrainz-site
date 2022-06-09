import * as Bootstrap from 'react-bootstrap';
import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import EditionSection from '../../entity-editor/edition-section/edition-section';
import React from 'react';


const {Card, Accordion} = Bootstrap;
export function DetailTab(props) {
	return (
		<div>
			<Accordion >
				<Card>
					<Accordion.Toggle as={Card.Header} eventKey="0">Extra info
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<EditionSection {...props}/>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			<AnnotationSection {...props}/>
		</div>);
}

export default DetailTab;
