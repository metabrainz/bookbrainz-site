import {CommonProps} from 'react-select';


export type RInputEvent = React.ChangeEvent<HTMLInputElement>;

export type IdentifierType = {
    id:number,
    entityType:string
};
type EditionFormat = {
	label: string,
	id: number
};

type EditionStatus = {
	label: string,
	id: number
};
type LanguageOption = {
	frequency: number,
	name: string,
	id: number
};
export type UnifiedFormDispatchProps = {
	onSubmit: (event:React.FormEvent) =>unknown
};
export type UnifiedFormProps = {
    identifierTypes?:IdentifierType[],
    validators?:Record<string, any>,
} & UnifiedFormDispatchProps;

export type CoverOwnProps = {
    languageOptions?: LanguageOption[],
	editionFormats?:EditionFormat[],
	identifierTypes:IdentifierType[]
	editionStatuses?: EditionStatus[]
};
export type CoverStateProps = {
    publisherValue:any[],
    identifierEditorVisible:boolean
};
export type CoverDispatchProps = {
    onPublisherChange: (arg:any)=>unknown
};
export type CoverProps = CoverOwnProps & CoverStateProps & CoverDispatchProps;

export type Action = {
	type: string,
	payload?: unknown,
	meta?: {
		debounce?: string
	}
};

export type ISBNStateProps = {
	type:number,
	value:string
};
export type ISBNDispatchProps = {
    onChange: (arg:RInputEvent)=>unknown
};
export type ISBNProps = ISBNStateProps & ISBNDispatchProps;

export type EntitySelect = {
	text:string,
	id:string
};
export type ContentTabStateProps = {
	nextId:string | number,
	value:any | any[]
};
export type ContentTabDispatchProps = {
	onChange:(arg:EntitySelect|EntitySelect[])=>unknown
};
export type ContentTabProps = ContentTabStateProps & ContentTabDispatchProps;

export type NavButtonsProps = {
    onNext:()=>unknown,
    onBack:()=>unknown,
    disableBack:boolean,
    disableNext:boolean
};
export type SearchEntityCreateDispatchProps = {
	onModalOpen:(arg:string)=>unknown,
	onModalClose:()=>unknown,
	onSubmitEntity:(arg:string)=>unknown
};

export type SearchEntityCreateOwnProps = {
	bbid?:string,
	empty?:boolean,
	nextId:string|number,
	error?:boolean,
	filters?:Array<any>,
	label:string,
	tooltipText?:string,
	languageOptions?:Array<any>,
	value?:Array<EntitySelect> | EntitySelect
	type:string,
	rowId?:string,
	onChange:(arg)=>unknown

};
export type SearchEntityCreateProps = SearchEntityCreateDispatchProps & SearchEntityCreateOwnProps & CommonProps<any, any>;
