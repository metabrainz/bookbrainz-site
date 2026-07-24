/* eslint-disable react/jsx-no-bind */

import {Alert, Button, Card, Spinner} from 'react-bootstrap';
import React, {useCallback, useState} from 'react';
import {faCheck, faListCheck, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import {ENTITY_TYPE_ICONS} from '../../helpers/entity';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


export default function SearchAdminPage() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [success, setSuccess] = useState(false);
	const indexEntity = useCallback(async (entityType?:string) => {
		let url = '/search/reindex';
		if (entityType) {
			url += `?type=${entityType}`;
		}
		setSuccess(false);
		setLoading(true);
		try {
			const res = await fetch(url, {headers: {'Request-Timeout': '600'}});
			if (!res.ok) {
				const body = await res.json();
				const err = body?.error;
				throw new Error(err || res.statusText);
			}
			setSuccess(true);
		}
		catch (error) {
			setErrorMessage(error.toString());
		}
		setLoading(false);
	}, []);
	return (
		<Card>
			<Card.Header as="h2">
				Search indexing
			</Card.Header>
			<Card.Body>
				<div
					style={
						{
							display: 'flex',
							flexWrap: 'wrap',
							gap: '0.5em',
							justifyContent: 'space-evenly'
						}
					}
				>
					<Button onClick={() => { indexEntity('Author'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Author}
							size="2x"
						/>
					</Button>

					<Button onClick={() => { indexEntity('Work'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Work}
							size="2x"
						/>
					</Button>
					<Button onClick={() => { indexEntity('Edition'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Edition}
							size="2x"
						/>
					</Button>
					<Button onClick={() => { indexEntity('EditionGroup'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.EditionGroup}
							size="2x"
						/>
					</Button>
					<Button onClick={() => { indexEntity('Publisher'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Publisher}
							size="2x"
						/>
					</Button>
					<Button onClick={() => { indexEntity('Series'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Series}
							size="2x"
						/>
					</Button>
					<Button onClick={() => { indexEntity('Area'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Area}
							size="2x"
						/>
					</Button>
					<Button onClick={() => { indexEntity('Collection'); }}>
						<FontAwesomeIcon
							icon={ENTITY_TYPE_ICONS.Collection}
							size="2x"
						/>
					</Button>
					<Button size="lg" variant="warning" onClick={() => { indexEntity(); }}>
						<FontAwesomeIcon
							icon={faListCheck}
						/> All entities
					</Button>
				</div>
				<br/>
				<div>
					{loading && <><Spinner animation="border"/> In progress...</>}
					{success &&
					<Alert dismissible variant="success" onClose={() => { setSuccess(false); }}>
						<FontAwesomeIcon icon={faCheck}/> Success
					</Alert>
					}
					{errorMessage &&
					<Alert dismissible variant="danger" onClose={() => { setErrorMessage(''); }}>
						<FontAwesomeIcon icon={faTriangleExclamation}/> {errorMessage}
					</Alert>
					}
				</div>
			</Card.Body>
		</Card>
	);
}
