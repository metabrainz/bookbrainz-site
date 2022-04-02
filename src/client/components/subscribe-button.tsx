import {Button} from 'react-bootstrap';
import React from 'react';
import request from 'superagent';


type SubscribeButtonProps = {
    id:string,
	type:string,
};
function SubscribeButton({id, type}:SubscribeButtonProps) {
	/* eslint-disable react/jsx-no-bind */
	const [isSubscribed, setIsSubscribed] = React.useState(false);
	React.useEffect(() => {
		request.get(`/${type}/${id}/subscribed`).then(response => {
			if (response.body.isSubscribed) {
				setIsSubscribed(true);
			}
		});
	});
	function handleUnsubscribe() {
		const submissionUrl = `/${type}/${id}/unsubscribe`;
		request.post(submissionUrl)
			.then(() => {
				setIsSubscribed(false);
			});
	}
	function handleSubscribe() {
		const submissionUrl = `/${type}/${id}/subscribe`;
		request.post(submissionUrl)
			.then(() => {
				setIsSubscribed(true);
			});
	}
	if (!isSubscribed) {
		return (
			<Button
				bsStyle="success"
				className="margin-top-d15"
				onClick={() => handleSubscribe()}
			>
        Subscribe
			</Button>);
	}

	return (
		<Button
			bsStyle="danger"
			className="margin-top-d15"
			onClick={() => handleUnsubscribe()}
		>
        Unsubscribe
		</Button>);
}

export default SubscribeButton;
