import React from 'react';
import SingleEntityModal from './single-entity-modal';
import {get} from 'lodash';


type SingleEntityProps = {
    entity: any;
    isLast: boolean;
	languageOptions:any[]
};
export default function SingleEntity({entity, isLast, languageOptions}:SingleEntityProps) {
	const [showModal, setShowModal] = React.useState(false);
	const handleClose = React.useCallback(() => {
		setShowModal(false);
	}, []);
	const handleShow = React.useCallback(() => {
		setShowModal(true);
	}, []);
	return (
		<>
			<SingleEntityModal entity={entity} handleClose={handleClose} languageOptions={languageOptions} show={showModal}/>
			<span className="entities-preview" onClick={handleShow}>
				{get(entity, 'text') + (isLast ? '' : ', ')}
			</span>
		</>);
}
