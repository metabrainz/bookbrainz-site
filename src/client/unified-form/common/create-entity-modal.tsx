import * as Bootstrap from 'react-bootstrap';
import {getEntitySection, getValidator} from '../../entity-editor/helpers';
import {CreateEntityModalProps} from '../interface/type';
import EntityModalBody from './entity-modal-body';
import React from 'react';
import {filterIdentifierTypesByEntityType} from '../../../common/helpers/utils';
import {upperFirst} from 'lodash';


const {Modal} = Bootstrap;
export default function CreateEntityModal({show, handleClose, handleSubmit, type, ...rest}:CreateEntityModalProps) {
	const heading = `Add ${upperFirst(type)}`;
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
