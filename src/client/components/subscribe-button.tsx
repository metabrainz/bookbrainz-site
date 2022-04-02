import {Button} from 'react-bootstrap';
import React from 'react';
import request from 'superagent';


type SubscribeButtonProps = {
    bbid:string,
	isCollection?:boolean,
};
function SubscribeButton({bbid, isCollection}:SubscribeButtonProps) {
	/* eslint-disable react/jsx-no-bind */
	const [isSubscribed, setIsSubscribed] = React.useState(false);
	const postKey = isCollection ? 'collectionId' : 'bbid';
	React.useEffect(() => {
		request.get(`/subscription/${isCollection ? 'collection' : 'entity'}/isSubscribed/${bbid}`).then(response => {
			if (response.body.isSubscribed) {
				setIsSubscribed(true);
			}
		});
	});
	function handleUnsubscribe() {
		const submissionUrl = `/subscription/unsubscribe/${isCollection ? 'collection' : 'entity'}`;
		request.post(submissionUrl)
			.send({[postKey]: bbid})
			.then(() => {
				setIsSubscribed(false);
			});
	}
	function handleSubscribe() {
		const submissionUrl = `/subscription/subscribe/${isCollection ? 'collection' : 'entity'}`;
		request.post(submissionUrl)
			.send({[postKey]: bbid})
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
SubscribeButton.defaultProps = {
	isCollection: false
};
export default SubscribeButton;
