import {Modal} from 'react-bootstrap';
import React from 'react';
import SeriesSection from '../../entity-editor/series-section/series-section';


type Props = {
    show: boolean,
    onHideHandler: () => void,
};
export default function SeriesItemModal({show, onHideHandler, ...rest}:Props):JSX.Element {
	const props = {
		...rest,
		entityType: 'series',
		hideTypeOption: true
	};
	return (
		<Modal dialogClassName="series-item-dialog" show={show} onHide={onHideHandler}>
			<Modal.Header closeButton>
				<Modal.Title>Series Item</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<SeriesSection {...props}/>
			</Modal.Body>
		</Modal>
	);
}
