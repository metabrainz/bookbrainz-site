import {Accordion, Card} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {SingleAccordionProps} from '../interface/type';
import ValidationLabel from '../../entity-editor/common/validation-label';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';


export default function SingleAccordion({children, defaultActive, heading, onToggle, isEmpty, isValid}:SingleAccordionProps) {
	const inputLabel = (
		<ValidationLabel empty={isEmpty} error={!isValid}>
			{heading}
		</ValidationLabel>
	);
	return (
		<Accordion defaultActiveKey={defaultActive && '0'}>
			<Card className="icon-card">
				<Accordion.Collapse eventKey="0">
					<Card.Body>
						{children}
					</Card.Body>
				</Accordion.Collapse>
				<Accordion.Toggle as={Card.Header} eventKey="0" onClick={onToggle}>{inputLabel}
					<FontAwesomeIcon className="accordion-arrow" icon={faChevronRight}/>
				</Accordion.Toggle>
			</Card>
		</Accordion>
	);
}

SingleAccordion.defaultProps = {
	defaultActive: false,
	isEmpty: true,
	isValid: true,
	onToggle: null
};
