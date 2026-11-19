import * as bootstrap from 'react-bootstrap';
import {Trans, withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';


const {Accordion, Card, Button, Form, ButtonGroup} = bootstrap;
class PreviewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {baseUrl, sourceUrl, originalUrl, formBody, t: translate} = this.props;
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
				<h1>{translate('pages.preview.heading')}</h1>
				<p>
					<Trans
						components={{
							destSpan: <span className="font-weight-bold"/>,
							srcSpan: <span className="font-weight-bold"/>
						}}
						i18nKey="pages.preview.submitPrompt"
						values={{originalUrl, sourceUrl}}
					/>
				</p>
				<p>
					{translate('pages.preview.explanation')}
				</p>
				<Accordion>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} eventKey="0" variant="link">
								&#9654; {translate('pages.preview.submittedDataToggle')}
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey="0">
							<Card.Body>{formInputs}</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
				<ButtonGroup aria-label={translate('common.button.submit')} className="mb-3">
					<Button className="mr-3" type="submit" variant="primary">{translate('common.button.continue')}</Button>
					<Button href={baseUrl} variant="danger">{translate('common.button.cancel')}</Button>
				</ButtonGroup>
			</Form>);
	}
}

PreviewPage.propTypes = {
	baseUrl: PropTypes.string.isRequired,
	formBody: PropTypes.object.isRequired,
	originalUrl: PropTypes.string.isRequired,
	sourceUrl: PropTypes.string,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired
};
PreviewPage.defaultProps = {
	sourceUrl: null
};
export default withTranslation()(PreviewPage);
