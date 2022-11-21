import {Button, Modal} from 'react-bootstrap';
import React from 'react';


type Props = {
    title: string,
    message: string,
    show: boolean,
    onConfirm: () => void,
    onCancel: () => void
};
function ConfirmationModal(props:Props) {
	return (
		<Modal show={props.show} onHide={props.onCancel}>
			<Modal.Header>
				<Modal.Title>{props.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{props.message}</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={props.onCancel}>Cancel</Button>
				<Button onClick={props.onConfirm} >Confirm</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default ConfirmationModal;
