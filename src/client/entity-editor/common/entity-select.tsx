import * as React from 'react';
import {SingleValueProps} from 'react-select/src/components/SingleValue';
import {components} from 'react-select';
import {genEntityIconHTMLElement} from '../../helpers/entity';


function EntitySelect(
	props:SingleValueProps<any>
) {
	const {disambiguation, language, text, link, type, unnamedText} = props.data.value?.id ? props.data.value : props.data;
	const nameComponent = text || <i>{unnamedText}</i>;
	const contents = (
		<components.SingleValue {...props}>{
			type && genEntityIconHTMLElement(type)
		}
		{nameComponent}
		{
			disambiguation &&
				<span className="disambig margin-left-0-3"><small>({disambiguation})</small></span>
		}
		{
			language &&
				<span className="text-muted small margin-left-0-3">{language}</span>
		}
		</components.SingleValue>
	    );
	if (link) {
		return <a href={link}>{contents}</a>;
	}
	return contents;
}

EntitySelect.displayName = 'EntitySelect';

export default EntitySelect;
