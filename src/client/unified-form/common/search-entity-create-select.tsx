import AsyncCreatable from 'react-select/async-creatable';
import BaseEntitySearch from '../../entity-editor/common/entity-search-field-option';
import {CommonProps} from 'react-select';
import React from 'react';
import makeImmutable from '../../entity-editor/common/make-immutable';


const ImmutableCreatableAsync = makeImmutable(AsyncCreatable);
const defaultProps = {
	bbid: null,
	empty: true,
	error: false,
	filters: [],
	languageOptions: [],
	tooltipText: null
};
type SearchEntityCreaateProps = {
  bbid?:string,
  empty?:boolean,
  nextId:string|number,
  error?:boolean,
  filters?:Array<any>,
  label:string,
  tooltipText?:string,
  languageOptions?:Array<any>,
  type:string | Array<string>

} & typeof defaultProps & CommonProps<any, any>;

function SearchEntityCreaate(props:SearchEntityCreaateProps):JSX.Element {
	const {type, nextId} = props;
	const createLabel = React.useCallback((input) => `Create ${type} "${input}"`, [type]);
	const getNewOptionData = React.useCallback((input, label) => ({
		__isNew__: true,
		id: nextId,
		text: label,
		type
	}), [type, nextId]);
	return (<BaseEntitySearch
		SelectWrapper={ImmutableCreatableAsync}
		formatCreateLabel={createLabel}
		getNewOptionData={getNewOptionData}
		{...props}
	        />);
}
SearchEntityCreaate.defaultProps = defaultProps;
export default SearchEntityCreaate;

