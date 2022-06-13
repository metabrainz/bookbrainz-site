import * as Bootstrap from 'react-bootstrap';
import {getEntitySection, getValidator} from '../../entity-editor/helpers';
import EntityModalBody from './entity-modal-body';
import React from 'react';


const {Modal} = Bootstrap;
type CreateEntityModalProps = {
	handleClose:() => unknown,
	handleSubmit:(e)=> unknown,
	type:string,
	show:boolean
};
export default function CreateEntityModal({show, handleClose, handleSubmit, type, ...rest}:CreateEntityModalProps) {
	const heading = `Add ${type}`;
	const EntitySection = getEntitySection(type);
	const validate = getValidator(type);
	return (
		<Modal dialogClassName="uf-dialog" show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>{heading}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<EntityModalBody type={type} onModalSubmit={handleSubmit} {...rest} validate={validate}>
					<EntitySection/>
				</EntityModalBody>
			</Modal.Body>

		</Modal>
	);
}
