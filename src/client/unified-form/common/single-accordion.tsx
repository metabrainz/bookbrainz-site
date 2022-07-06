import {Accordion, Card} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';


type SingleAccordionProps = {
	children: React.ReactNode,
	defaultActive?: boolean,
	onToggle?: () => void,
	heading: string
};
export default function SingleAccordion({children, defaultActive, heading, onToggle}:SingleAccordionProps) {
	return (
		<Accordion defaultActiveKey={defaultActive && '0'}>
			<Card className="icon-card">
				<Accordion.Collapse eventKey="0">
					<Card.Body>
						{children}
					</Card.Body>
				</Accordion.Collapse>
				<Accordion.Toggle as={Card.Header} eventKey="0" onClick={onToggle}>{heading}
					<FontAwesomeIcon className="accordion-arrow" icon={faChevronRight}/>
				</Accordion.Toggle>
			</Card>
		</Accordion>
	);
}

SingleAccordion.defaultProps = {
	defaultActive: false,
	onToggle: null
};
