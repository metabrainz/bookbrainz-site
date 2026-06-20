import * as Bootstrap from 'react-bootstrap';
import {faAngleLeft, faAngleRight, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {NavButtonsProps} from './interface/type';
import React from 'react';


const {Row, Col, Button, Alert} = Bootstrap;

export default function NavButtons({onNext, onBack, disableBack, disableNext, errorMessage}:NavButtonsProps) {
	return (
		<>
			{errorMessage && (
				<Alert className="text-center" variant="danger">
					<FontAwesomeIcon className="mr-2" icon={faExclamationTriangle} size="lg"/>
					{errorMessage}
				</Alert>
			)}
			<Row className="uf-navbtn-row">
				<Col>
					<Button href="/" type="button" variant="danger">Cancel </Button>
				</Col>
				<Col>
					<Button disabled={disableBack} type="button" variant="primary" onClick={onBack}><FontAwesomeIcon icon={faAngleLeft}/> Back</Button>
				</Col>
				<Col>
					<Button disabled={disableNext} type="button" variant="primary" onClick={onNext}>Next <FontAwesomeIcon icon={faAngleRight}/></Button>
				</Col>
			</Row>
		</>
	);
}
