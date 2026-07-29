import * as Bootstrap from 'react-bootstrap';
import {camelCase, upperFirst} from 'lodash';
import {getEntitySection, getValidator} from '../../entity-editor/helpers';
import {CreateEntityModalProps} from '../interface/type';
import EntityModalBody from './entity-modal-body';
import React from 'react';
import {filterIdentifierTypesByEntityType} from '../../../common/helpers/utils';
import {useTranslation} from 'react-i18next';


const {Modal} = Bootstrap;
export default function CreateEntityModal({show, handleClose, handleSubmit, type, ...rest}:CreateEntityModalProps) {
	const {t: translate} = useTranslation(['entityEditor', 'common']);
	const heading = translate('unifiedForm.addEntityHeading', {entityType: translate(`common:entityType.${camelCase(type)}`)});
	const EntitySection = getEntitySection(type);
	const validate = getValidator(type);
	const {allIdentifierTypes} = rest;
	const entityIdentifierTypes = filterIdentifierTypesByEntityType(allIdentifierTypes, upperFirst(type));
	return (
		<Modal dialogClassName="uf-dialog" show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>{heading}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<EntityModalBody
					onModalSubmit={handleSubmit} {...rest} entityType={type}
					identifierTypes={entityIdentifierTypes} validate={validate}
				>
					<EntitySection/>
				</EntityModalBody>
			</Modal.Body>

		</Modal>
	);
}
