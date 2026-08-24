/* eslint-disable react/jsx-no-bind, react/no-array-index-key */
import * as React from 'react';
import {Button, Card, Col, Form, Modal, OverlayTrigger, Row, Table, Tooltip} from 'react-bootstrap';
import {faPlus, faQuestionCircle, faTrash} from '@fortawesome/free-solid-svg-icons';
import {sortWorkTypes, workTypeSelectMenuOption} from '../../entity-editor/work-section/work-section';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IdentifierRow} from '../../entity-editor/identifier-editor/identifier-row';
import LanguageField from '../../entity-editor/common/language-field';
import Select from 'react-select';
import {guessIdentifierType} from '../../helpers/data';
import {validateIdentifierValue} from '../../entity-editor/validators/common';


type WorkType = {
    id: number;
    label: string;
	parentId?: number | null;
    childOrder?: number;
    description?: string;
    depth?: number;
    deprecated?: boolean;
};

type LanguageOption = {
    id: number;
    name: string;
    frequency: number;
};

type IdentifierType = {
    id: number;
    name: string;
    detectionRegex?: string;
	label?: string;
	validationRegex?: string;
};

type WorkRow = {
    title: string;
    languageId?: number | null;
    identifiers?: {typeId: number | null, value: string}[];
};

type Props = {
    workTypes: Array<WorkType>;
    languageOptions: Array<LanguageOption>;
    identifierTypes: Array<IdentifierType>;
    submissionUrl: string;
};

function CreateMultipleWorks({workTypes, languageOptions, identifierTypes, submissionUrl}: Props) {
	const [works, setWorks] = React.useState<WorkRow[]>([{title: ''}]);
	const [globalType, setGlobalType] = React.useState<{id: number, label: string, value: number} | null>(null);
	const [globalLanguages, setGlobalLanguages] = React.useState<number[]>([]);
	const [defaultNameLanguage, setDefaultNameLanguage] = React.useState<number | null>(null);
	const [submitting, setSubmitting] = React.useState(false);
	const [identifierRowIndex, setIdentifierRowIndex] = React.useState<number | null>(null);
	const [tempIdentifiers, setTempIdentifiers] = React.useState<{typeId: number | null, value: string}[]>([]);
	const [createdWorks, setCreatedWorks] = React.useState([]);
	const [error, setError] = React.useState<string | null>(null);
	const isFormValid = works.every(work => work.title?.trim() && work.languageId);
	const languageOptionsToDisplay = languageOptions.map((lang) => ({
		frequency: lang.frequency,
		label: lang.name,
		value: lang.id
	}));
	const validWorkTypes = workTypes.filter(type => !type.deprecated);
	const workTypesToDisplay = sortWorkTypes(validWorkTypes);

	function addRow() {
		setWorks(currentWorks => [...currentWorks, {languageId: defaultNameLanguage, title: ''}]);
	}

	function removeRow(index: number) {
		setWorks(currentWorks => currentWorks.filter((_, i) => i !== index));
	}

	function updateTitle(index: number, value: string) {
		setWorks(currentWorks => currentWorks.map((work, i) => (i === index ? {...work, title: value} : work)));
	}

	function updateLanguage(index: number, value: any) {
		setWorks(currentWorks => currentWorks.map((work, i) => (i === index ? {...work, languageId: value ? value.value : null} : work)));
	}

	function openIdentifier(index: number) {
		setIdentifierRowIndex(index);
		const existingIdentifiers = works[index].identifiers || [];
		if (existingIdentifiers.length === 0) {
			setTempIdentifiers([{typeId: null, value: ''}]);
		}
		else {
			setTempIdentifiers(existingIdentifiers);
		}
	}

	function closeIdentifier() {
		setIdentifierRowIndex(null);
		setTempIdentifiers([]);
	}

	function saveIdentifiers() {
		if (identifierRowIndex !== null) {
			const valid = tempIdentifiers.filter(id => id.typeId !== null && id.value.trim() !== '');
			setWorks(currentWorks =>
				currentWorks.map((workObject, i) =>
					(i === identifierRowIndex ? {...workObject, identifiers: valid} : workObject)));
		}
		closeIdentifier();
	}

	function addTempIdentifier() {
		setTempIdentifiers(current => [...current, {typeId: null, value: ''}]);
	}

	function updateTempIdentifier(index: number, field: 'typeId' | 'value', value: any) {
		setTempIdentifiers(current => current.map((id, i) => {
			if (i !== index) { return id; }
			let updatedValue = value;
			let updatedTypeId = id.typeId;
			if (field === 'value') {
				const guessedType = guessIdentifierType(value, identifierTypes) as any;
				if (guessedType) {
					const regexResult = new RegExp(guessedType.detectionRegex).exec(value);
					if (regexResult && regexResult[1]) {
						updatedValue = regexResult[1];
						updatedTypeId = guessedType.id;
					}
				}
			}
			return {...id, [field]: updatedValue, typeId: field === 'typeId' ? value : updatedTypeId};
		}));
	}

	function removeTempIdentifier(index: number) {
		setTempIdentifiers(current => current.filter((_, i) => i !== index));
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			const response = await fetch(submissionUrl, {
				body: JSON.stringify({
					globalLanguages,
					globalTypeId: globalType?.id ?? null,
					note: 'Batch work creation',
					works
				}),
				headers: {'Content-Type': 'application/json'},
				method: 'POST'
			});
			if (!response.ok) {
				throw new Error('Submission failed');
			}
			const result = await response.json();
			setCreatedWorks(result);
		}
		catch (err) {
			setError('Something went wrong. Please try again.');
		}
		finally {
			setSubmitting(false);
		}
	}

	const areTempIdentifiersValid = tempIdentifiers.every(id => {
		if (id.typeId === null && id.value.trim() === '') {
			return true;
		}
		if (id.typeId === null || id.value.trim() === '') {
			return false;
		}

		return validateIdentifierValue(id.value, id.typeId, identifierTypes as any);
	});

	return (
		<React.Fragment>
			<Card>
				<Card.Header as="h4">
					<a className="create-works-tab-link inactive" href="/work/create">
                        Add Work
					</a>
					<span className="text-muted mx-2">|</span>
					<a className="create-works-tab-link">
                        Add Multiple Works
					</a>
				</Card.Header>
				<Card.Body>
					{createdWorks.length > 0 &&
					<div className="alert alert-success">
						<strong>{createdWorks.length} Work created successfully</strong>
						<ul>
							{createdWorks.map((work: any) => (
								<li key={work.bbid}>
									<a href={`/work/${work.bbid}`}>{work.defaultAlias?.name}</a>
								</li>
							))}
						</ul>
					</div>
					}
					{error && <div className="alert alert-danger">{error}</div>}
					<Form onSubmit={handleSubmit}>
						<Row className="mb-4">
							<Col lg={12}>
								<h2>What language to use for the Name?</h2>
								<hr/>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col lg={6}>
								<LanguageField
									empty={!defaultNameLanguage}
									instanceId="default-name-language"
									options={languageOptionsToDisplay}
									tooltipText="Language used for the name/title of the works"
									onChange={(val: any) => {
										const newGlobalLang = val ? val.value : null;
										setDefaultNameLanguage(newGlobalLang);
										setWorks(currentWorks => currentWorks.map(work => ({
											...work,
											languageId: newGlobalLang
										})));
									}}
								/>
								<small className="text-muted d-block mt-1">This applies to the Names of the works you type below.</small>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col lg={12}>
								<h2>What else do you know about these works?</h2>
								<span className="text-muted">All fields optional - leave something blank if you don&apos;t know it</span>
								<hr/>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col lg={6}>
								<Form.Group>
									<Form.Label><strong>Default Type</strong>(optional)</Form.Label>
									<Select
										isClearable
										classNamePrefix="react-select"
										components={{Option: workTypeSelectMenuOption}}
										getOptionLabel={(typeObj) => typeObj.label}
										getOptionValue={(typeObj) => String(typeObj.id)}
										instanceId="workType"
										options={workTypesToDisplay}
										value={workTypesToDisplay.find((el) => el.id === globalType?.id) || null}
										onChange={(val) => setGlobalType(val)}
									/>
								</Form.Group>
							</Col>
							<Col lg={6}>
								<LanguageField
									empty
									isMulti
									instanceId="global-work-languages"
									options={languageOptionsToDisplay}
									tooltipText="Main language used for the content of the work"
									onChange={(vals: any) => setGlobalLanguages(vals ? vals.map((val: any) => val.value) : [])}
								/>
								<small className="text-muted d-block mt-1">Select one or multiple languages for the Works being created (optional)</small>
							</Col>
						</Row>
						<Table bordered hover>
							<thead>
								<tr>
									<th style={{width: '5%'}}>#</th>
									<th style={{width: '45%'}}>Title</th>
									<th style={{width: '25%'}}>
                                    Language
										<OverlayTrigger
											delay={50}
											overlay={<Tooltip id="lang-tooltip">Language used for the name/title of the works</Tooltip>}
										>
											<FontAwesomeIcon
												className="margin-left-0-5"
												icon={faQuestionCircle}
											/>
										</OverlayTrigger>
									</th>
									<th style={{width: '15%'}}>Identifiers</th>
									<th style={{width: '10%'}}>Remove</th>
								</tr>
							</thead>
							<tbody>
								{works.map((work, idx) => (
									<tr key={idx}>
										<td className="align-middle">{idx + 1}</td>
										<td className="align-middle">
											<Form.Control
												required
												placeholder="Enter work title"
												type="text"
												value={work.title}
												onChange={(event) => updateTitle(idx, event.target.value)}
											/>
										</td>
										<td className="align-middle">
											<LanguageField
												hideLabel
												empty={!work.languageId}
												instanceId={`work-language-${idx}`}
												options={languageOptionsToDisplay}
												value={languageOptionsToDisplay.filter(opt => opt.value === work.languageId)}
												onChange={(val: any) => updateLanguage(idx, val)}
											/>
										</td>
										<td className="text-center align-middle">
											<Button variant="link" onClick={() => openIdentifier(idx)}>
												{(work.identifiers?.length || 0) === 0 ?
													'Add identifiers' :
													`Edit ${work.identifiers.length} identifier${work.identifiers.length > 1 ? 's' : ''}`}
											</Button>
										</td>
										<td className="text-center align-middle">
											<Button
												disabled={works.length === 1}
												size="sm"
												variant="danger"
												onClick={() => removeRow(idx)}
											>
												<FontAwesomeIcon icon={faTrash}/>
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
						<div className="mb-3">
							<Button variant="secondary" onClick={addRow}>
								<FontAwesomeIcon className="me-1" icon={faPlus}/>
                            Add Row
							</Button>
						</div>
						<div className="text-end">
							<Button disabled={submitting || !isFormValid} type="submit" variant="primary">
								{submitting ? 'Creating...' : `Create ${works.length} Work${works.length !== 1 ? 's' : ''}`}
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
			<Modal show={identifierRowIndex !== null} size="lg" onHide={closeIdentifier}>
				<Modal.Header>
					<Modal.Title>Identifier Editor (Row {identifierRowIndex !== null ? identifierRowIndex + 1 : ''})</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{tempIdentifiers.length === 0 ?
						<p className="text-muted text-center">This entity has no identifiers</p> :
						tempIdentifiers.map((id, idx) => (
							<IdentifierRow
								index={idx}
								key={idx}
								typeOptions={identifierTypes as any}
								typeValue={id.typeId}
								valueValue={id.value}
								onRemoveButtonClick={() => removeTempIdentifier(idx)}
								onTypeChange={(val: any) => updateTempIdentifier(idx, 'typeId', val ? val.value : null)}
								onValueChange={(event: React.ChangeEvent<HTMLInputElement>) => updateTempIdentifier(idx, 'value', event.target.value)}
							/>
						))
					}
					<Row>
						<Col className="text-end">
							<Button variant="success" onClick={addTempIdentifier}>
								<FontAwesomeIcon className="me-1" icon={faPlus}/>
                                Add identifier
							</Button>
						</Col>
					</Row>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeIdentifier}>Cancel</Button>
					<Button disabled={!areTempIdentifiersValid} variant="primary" onClick={saveIdentifiers}>Save Identifiers</Button>
				</Modal.Footer>
			</Modal>
		</React.Fragment>
	);
}

CreateMultipleWorks.displayName = 'CreateMultipleWorks';
export default CreateMultipleWorks;
