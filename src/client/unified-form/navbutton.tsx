import * as Bootstrap from 'react-bootstrap';
import {faAngleLeft, faAngleRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {NavButtonsProps} from './interface/type';
import React from 'react';
import {useTranslation} from 'react-i18next';


const {Row, Col, Button} = Bootstrap;

export default function NavButtons({onNext, onBack, disableBack, disableNext}:NavButtonsProps) {
	const {t: translate} = useTranslation('common');
	return (
		<Row className="uf-navbtn-row">
			<Col>
				<Button href="/" type="button" variant="danger">{translate('button.cancel')}</Button>
			</Col>
			<Col>
				<Button disabled={disableBack} type="button" variant="primary" onClick={onBack}><FontAwesomeIcon icon={faAngleLeft}/> {translate('button.back')}</Button>
			</Col>
			<Col>
				<Button disabled={disableNext} type="button" variant="primary" onClick={onNext}>{translate('button.next')} <FontAwesomeIcon icon={faAngleRight}/></Button>
			</Col>
		</Row>
	);
}
