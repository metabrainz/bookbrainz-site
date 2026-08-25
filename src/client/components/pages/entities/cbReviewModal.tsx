/* eslint-disable react/no-unused-state */
/*
 * Copyright (C) 2022       Ansh Goyal
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as bootstrap from 'react-bootstrap';
// eslint-disable-next-line import/no-internal-modules
import * as eng from '@cospired/i18n-iso-languages/langs/en.json';
import * as iso from '@cospired/i18n-iso-languages';
import {Trans, withTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/named
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {Rating} from 'react-simple-star-rating';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import {countWords} from '../../../helpers/utils';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import request from 'superagent';


const {Alert, Modal} = bootstrap;
iso.registerLocale(eng);

export interface CBReviewModalProps {
	entityBBID: string;
	entityName: string;
	entityType: string;
	userId: number;
	showModal: boolean;
	handleModalToggle: () => void;
    handleUpdateReviews: () => void;
}

export interface CBReviewModalState {
	acceptLicense: boolean;
	alert: Record<string, any>;
	language: string;
	rating: number;
	reviewValidateAlert: string | null;
	success: boolean;
	textContent: string;
	reviewID?: string;
}

class CBReviewModal extends React.Component<
	CBReviewModalProps,
	CBReviewModalState
> {
	constructor(props: CBReviewModalProps) {
		super(props);
		this.state = {
			acceptLicense: false,
			alert: {
				message: '',
				title: '',
				type: ''
			},
			language: 'en',
			rating: 0,
			reviewID: '',
			reviewValidateAlert: null,
			success: false,
			textContent: ''
		};
	}

	// eslint-disable-next-line react/sort-comp
	readonly minTextLength = 25;

	readonly maxTextLength = 100000;

	private CBBaseUrl = 'https://critiquebrainz.org';

	private MBBaseUrl = 'https://metabrainz.org';

	// gets all iso-639-1 languages and codes for dropdown
	private allLanguagesKeyValue = Object.entries(iso.getNames('en'));

	private CBInfoButton() {
		const {t: translate} = this.props;
		return (
			<span>
				<span
					className="CBInfoButton"
					data-event="click focus"
					data-tip={translate('pages.entity.cbTooltip', {cbUrl: this.CBBaseUrl, mbUrl: this.MBBaseUrl})}
				>
					<FontAwesomeIcon
						icon={faInfoCircle as IconProp}
						style={{color: 'black'}}
					/>
				</span>
				<ReactTooltip
					clickable
					html
					className="cb-data-tip"
					globalEventOff="click"
					place="bottom"
				/>
			</span>
		);
	}

	handleError = (error: string | Error, title?: string): void => {
		if (!error) {
			return;
		}
		this.setState({
			alert: {
				message: typeof error === 'object' ? error.message : error,
				title: title || 'Error',
				type: 'danger'
			}
		});
	};

	getAccessToken = async () => {
		try {
			const response = await request
				.post('/external-service/critiquebrainz/refresh');

			if (response?.status === 200 && response?.body?.accessToken) {
				return response.body.accessToken;
			}

			return null;
		}
		catch (error) {
			const {t: translate} = this.props;
			this.handleError(error, translate('pages.entity.cbFetchError'));
		}
		return null;
	};

	handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {target} = event;
		const value =
			target.type === 'checkbox' ?
				(target as HTMLInputElement).checked :
				target.value;
		const {name} = target;

		this.setState({
			[name]: value
		} as any);
	};

	handleTextInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const {reviewValidateAlert} = this.state;
		event.preventDefault();
		// remove excessive line breaks to match formatting to CritiqueBrainz
		const input = event.target.value.replace(/\n\s*\n\s*\n/g, '\n');
		if (input.length <= this.maxTextLength) {
			// cap input at maxTextLength
			this.setState({textContent: input});
		}

		if (reviewValidateAlert && input.length >= this.minTextLength) {
			// if warning was shown, rehide it when the input meets minTextLength
			this.setState({
				reviewValidateAlert: null
			});
		}
	};

	handleRatingsChange = (rate: number) => {
		this.setState({
			rating: rate / 20
		});
	};

	resetCBReviewForm = () => {
		this.setState({
			acceptLicense: false,
			rating: 0,
			reviewValidateAlert: null,
			success: true,
			textContent: ''
		});
	};

	handleCloseModal = () => {
		this.setState({
			acceptLicense: false,
			alert: {
				message: '',
				title: '',
				type: ''
			},
			language: 'en',
			rating: 0,
			reviewValidateAlert: null,
			textContent: ''
		});
		this.props.handleModalToggle();
	};

	handleSubmitToCB = async (
		event?: React.FormEvent<HTMLFormElement>
	): Promise<null> => {
		if (event) {
			event.preventDefault();
		}

		const {
			entityBBID,
			entityType,
			userId,
			t: translate
		} = this.props;

		const {
			acceptLicense,
			language,
			rating,
			textContent
		} = this.state;

		if (textContent.length < this.minTextLength) {
			this.setState({
				reviewValidateAlert: translate('pages.entity.cbMinLengthError', {minLen: this.minTextLength})
			});
			return null;
		}

		if (userId &&
			this.accessToken &&
			acceptLicense
		) {
			let nonZeroRating: number;
			if (rating !== 0) {
				nonZeroRating = rating;
			}

			const review = {
				entityBBID,
				entityType,
				language,
				rating: nonZeroRating,
				textContent
			};

			try {
				let result: any;
				const response = await request.post(`/${entityType}/${entityBBID}/reviews`)
					.set('Content-Type', 'application/json')
					.send({
						accessToken: this.accessToken,
						review
					});

				if (response.ok) {
					result = response.body;
				}

				if (result?.reviewID) {
					this.setState({
						alert: {
							message: translate('pages.entity.cbSubmitSuccess'),
							title: translate('pages.entity.cbSuccess'),
							type: 'success'
						}
					});
					this.setState({
						reviewID: result?.reviewID
					});
					this.resetCBReviewForm();
					this.props.handleUpdateReviews();
				}
				else {
					this.setState({
						alert: {
							message: result?.message,
							title: translate('pages.entity.cbErrorSubmitting'),
							type: 'danger'
						}
					});
				}
			}
			catch (error) {
				this.handleError(
					error,
					translate('pages.entity.cbErrorSubmittingDetail')
				);
			}
		}
		return null;
	};


	getModalBody = (hasPermissions: boolean) => {
		const {
			acceptLicense,
			alert,
			language,
			rating,
			reviewID,
			reviewValidateAlert,
			success,
			textContent
		} = this.state;
		const {t: translate} = this.props;

		if (!hasPermissions) {
			return (
				<div>
					<Trans
						components={{
							b: <b/>,
							cbLink: <a href={this.CBBaseUrl}/>
						}}
						i18nKey="pages.entity.cbConnectPrompt"
					/>
					{this.CBInfoButton()}
					<br/>
					<br/>
					<Trans
						components={{
							externalLink: <a href={`${window.location.origin}/external-service/`}/>
						}}
						i18nKey="pages.entity.cbConnectInstructions"
					/>
				</div>
			);
		}

		if (success) {
			return (
				<div>
					<Trans
						components={{
							b: <b/>
						}}
						i18nKey="pages.entity.cbThanks"
						values={{entityName: this.props.entityName}}
					/>
					<br/>
					<br/>
					<Trans
						components={{
							reviewLink: <a href={`${this.CBBaseUrl}/review/${reviewID}`}/>
						}}
						i18nKey="pages.entity.cbAccessReview"
					/>
				</div>
			);
		}

		return (
			<>
				{alert?.message && (
					<Alert variant={alert.type}>
						<Alert.Heading>{alert.title}</Alert.Heading>
						<p>{alert.message}</p>
					</Alert>
				)}

				{reviewValidateAlert && (
					<Alert variant="danger">
						<p>{reviewValidateAlert}</p>
					</Alert>
				)}

				<Trans
					components={{
						b: <b/>,
						cbLink: <a href={this.CBBaseUrl}/>
					}}
					i18nKey="pages.entity.cbReviewingHeader"
					values={{
						entityName: this.props.entityName,
						entityType: this.props.entityType
					}}
				/>{' '}
				{this.CBInfoButton()}
				<div className="form-group">
					<textarea
						required
						className="form-control"
						id="review-text"
						name="review-text"
						placeholder={translate('pages.entity.cbReviewMinLengthPlaceholder', {minLen: this.minTextLength})}
						rows={6}
						spellCheck="false"
						style={{resize: 'vertical'}}
						value={textContent}
						onChange={this.handleTextInputChange}
					/>
				</div>
				<small
					className={
						textContent.length < this.minTextLength ?
							'text-danger' :
							''
					}
					style={{display: 'block', textAlign: 'right'}}
				>
					{translate('pages.entity.cbWordCharCount', {
						chars: textContent?.length,
						words: countWords(textContent)
					})}
				</small>
				<div className="rating-container">
					<b>{translate('pages.entity.ratingOptional')}&nbsp;</b>
					<Rating
						transition
						className="rating-stars"
						size={20}
						value={rating}
						onClick={this.handleRatingsChange}
					/>
				</div>
				<div className="dropdown">
					<b>{translate('pages.entity.reviewLanguage')}&nbsp;</b>
					<select
						id="language-selector"
						name="language"
						value={language}
						onChange={this.handleInputChange}
					>
						{this.allLanguagesKeyValue.map((lang: any) => (
							<option key={lang[0]} value={lang[0]}>
								{lang[1]}
							</option>
						))}
					</select>
				</div>
				<div className="checkbox">
					<label>
						<input
							required
							checked={acceptLicense}
							id="acceptLicense"
							name="acceptLicense"
							type="checkbox"
							onChange={this.handleInputChange}
						/>
						<small>
							&nbsp;{translate('pages.entity.cbLicenseNotice')}
						</small>
					</label>
				</div>
			</>
		);
	};

	getModalFooter = (hasPermissions: boolean) => {
		const {success} = this.state;
		const {t: translate} = this.props;

		if (!hasPermissions) {
			return (
				<a
					className="btn btn-success"
					href={`${window.location.origin}/external-service/`}
					role="button"
				>
					{' '}
					{translate('pages.entity.cbConnectButton')}{' '}
				</a>
			);
		}
		if (!success) {
			const {reviewValidateAlert} = this.state;

			return (
				<button
					className={`btn btn-success ${
						reviewValidateAlert ? 'disabled' : ''
					}`}
					id="submitReviewButton"
					type="submit"
				>
					{translate('pages.entity.cbSubmitButton')}
				</button>
			);
		}

		/* default: close modal button */
		return (
			<button
				className="btn btn-default"
				type="button"
				onClick={this.handleCloseModal}
			>
				{translate('pages.entity.cbCloseButton')}
			</button>
		);
	};

	private accessToken = '';

	/* executes getAccessToken() only in a browser to avoid unnecessary server-side calls during component mounting */
	componentDidMount = async () => {
		if (typeof window !== 'undefined') {
			this.accessToken = await this.getAccessToken();
		}
	};

	render() {
		const hasPermissions = this.accessToken !== null;
		const modalBody = this.getModalBody(hasPermissions);
		const modalFooter = this.getModalFooter(hasPermissions);

		return (
			<Modal
				centered
				aria-labelledby="CBReviewModalLabel"
				id="CBReviewModal"
				show={this.props.showModal}
				onHide={this.handleCloseModal}
			>
				<form
					className="modal-content"
					onSubmit={this.handleSubmitToCB}
				>
					<Modal.Header
						closeButton
					>
						<h4
							className="modal-title"
							id="CBReviewModalLabel"
							style={{padding: 'auto'}}
						>
							<img
								alt="CritiqueBrainz Logo"
								className="cb-img-responsive"
								height="30"
								src="/images/critiquebrainz-logo.svg"
								style={{margin: '8px'}}
							/>
						</h4>
					</Modal.Header>
					<Modal.Body>{modalBody}</Modal.Body>
					<Modal.Footer>{modalFooter}</Modal.Footer>
				</form>
			</Modal>
		);
	}
}

export default withTranslation()(CBReviewModal);
