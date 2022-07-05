import * as Bootstrap from 'react-bootstrap';
import AnnotationSection from '../../entity-editor/annotation-section/annotation-section';
import EditionSection from '../../entity-editor/edition-section/edition-section';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';


const {Card, Accordion} = Bootstrap;
export function DetailTab(props) {
	return (
		<div>
			<Accordion>
				<Card className="icon-card">
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<EditionSection {...props}/>
						</Card.Body>
					</Accordion.Collapse>
					<Accordion.Toggle as={Card.Header} eventKey="0">Extra info
						<FontAwesomeIcon className="accordion-arrow" icon={faChevronRight}/>
					</Accordion.Toggle>
				</Card>
			</Accordion>
			<AnnotationSection {...props}/>
		</div>);
}

export default DetailTab;
