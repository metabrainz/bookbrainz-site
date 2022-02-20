import * as bootstrap from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';


const {Accordion, Card, Button, Form, ButtonGroup} = bootstrap;
class PreviewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {baseUrl, sourceUrl, originalUrl, formBody} = this.props;
		const formInputs = [];
		for (const field in formBody) {
			if (Object.hasOwnProperty.call(formBody, field)) {
				const value = formBody[field];
				formInputs.push(
					<Form.Group controlId={field} key={field}>
						<Form.Label>{field}</Form.Label>
						<Form.Control as={field.includes('submissionSection') ? 'textarea' : 'input'} defaultValue={value} name={field}/>
					</Form.Group>
				);
			}
		}
		return (
			<Form action={originalUrl} method="POST">
				<h1>Confirm Form Submission</h1>
				<p>You are about to submit a request to <span className="font-weight-bold">{originalUrl}</span> originating from
					<span className="font-weight-bold"> {sourceUrl} </span>. Continue?
				</p>
				<p>This confirmation is important to ensure that no malicious actor can use your account to modify data without your knowledge.
				Below this line, you can review the data being sent and make any modifications if desired.
				</p>
				<Accordion>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} eventKey="0" variant="link"> &#9654; Data submitted with this request
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey="0">
							<Card.Body>{formInputs}</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
				<ButtonGroup aria-label="submit" className="mb-3">
					<Button className="mr-3" type="submit" variant="primary">Continue</Button>
					<Button href={baseUrl} variant="danger">Cancel</Button>
				</ButtonGroup>
			</Form>);
	}
}

PreviewPage.propTypes = {
	baseUrl: PropTypes.string.isRequired,
	formBody: PropTypes.object.isRequired,
	originalUrl: PropTypes.string.isRequired,
	sourceUrl: PropTypes.string
};
PreviewPage.defaultProps = {
	sourceUrl: null
};
export default PreviewPage;
