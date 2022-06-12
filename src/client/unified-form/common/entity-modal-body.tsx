// import * as Bootstrap from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import {upperFirst} from 'lodash';


type EntityModalBodyProps = {
    onModalSubmit:(e)=>unknown,
    type:string
};

export default function EntityModalBody({onModalSubmit, type, ...rest}:EntityModalBodyProps) {
	return (
		<form onSubmit={onModalSubmit}>

			<NameSection isUf type={upperFirst(type)} {...rest}/>
			<Button onClick={onModalSubmit}>Submit</Button>
		</form>);
}
