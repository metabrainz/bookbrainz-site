import Immutable from 'immutable';


export type RInputEvent = React.ChangeEvent<HTMLInputElement>;

export type Action = {
	type: string,
	payload?: any,
	meta?: {
		debounce?: string
	}
};

export type Entity = {
	__isNew__: boolean,
	text:string,
	type:string,
	id:string
};
export type State = Immutable.Map<string, any>;

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

export type SingleAccordionProps = {
	children: React.ReactNode,
	defaultActive?: boolean,
	onToggle?: () => void,
	isEmpty?: boolean,
	isValid?: boolean,
	heading: string
};

export type UnifiedFormDispatchProps = {
	onSubmit: (event:React.FormEvent) =>unknown
};
export type UnifiedFormStateProps = {
	contentTabEmpty: boolean,
	detailTabValid: boolean,
	detailTabEmpty: boolean,
	coverTabValid: boolean,
	coverTabEmpty: boolean,
	formValid:boolean
};
export type UnifiedFormOwnProps = {
    allIdentifierTypes?:IdentifierType[],
	languageOptions?:LanguageOption[],
    validator?:(state:Immutable.Map<string, any>, ...args) => boolean,
};
export type UnifiedFormProps = UnifiedFormOwnProps & UnifiedFormDispatchProps & UnifiedFormStateProps;

export type CoverOwnProps = {
    languageOptions?: LanguageOption[],
	editionFormats?:EditionFormat[],
	identifierTypes:IdentifierType[]
	editionStatuses?: EditionStatus[]
};
export type CoverStateProps = {
    publisherValue:any[],
	modalIsOpen:boolean,
    identifierEditorVisible:boolean
};
export type CoverDispatchProps = {
    onPublisherChange: (arg:any)=>unknown,
    onClearPublisher: (arg:string)=>unknown,
	handleClearPublishers: ()=>unknown
};
export type CoverProps = CoverOwnProps & CoverStateProps & CoverDispatchProps;

export type ISBNStateProps = {
	autoISBN: boolean,
	type:number,
	value:string
};
export type ISBNDispatchProps = {
    onChange: (...arg)=>unknown,
	onAutoISBNChange: (arg:boolean)=>unknown,
};
export type ISBNProps = ISBNStateProps & ISBNDispatchProps;

export type dispatchResultProps = {
	payload: {
			rowId: number,
			type:number,
			value:string
		},
		type: string
};

export type EntitySelect = {
	text:string,
	id:string
};
export type ContentTabStateProps = {
	works:any | any[],
	series:any | any[]
};
export type ContentTabDispatchProps = {
	onChange:(value:EntitySelect)=>unknown,
	onAddSeriesItem:(data:any)=>unknown,
	onSeriesChange:(value:EntitySelect)=>unknown,
	resetSeries:(itemsOnly?:boolean)=>void,
	onSubmitWork:()=>unknown,
	bulkAddSeriesItems:(data)=>unknown,
	onModalOpen:(arg)=>unknown,
	onModalClose:()=>unknown,
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
	onAddCallback?:(...arg)=>unknown,
	onOpenCallback?:(...arg)=>unknown,
	empty?:boolean,
	isClearable?:boolean,
	isMulti?:boolean,
	nextId?:string|number,
	error?:boolean,
	filters?:Array<any>,
	label?:string,
	tooltipText?:string,
	languageOptions?:Array<any>,
	value?:Array<EntitySelect> | EntitySelect
	type:string,
	rowId?:string,
	onChange:(arg, ...optional)=>unknown

};
export type SearchEntityCreateProps = SearchEntityCreateDispatchProps & SearchEntityCreateOwnProps;

export type EntityModalStateProps = {
	isNameSectionValid:boolean,
	isNameSectionEmpty:boolean,
	isAliasEditorValid:boolean,
	isIdentifierEditorValid:boolean,
	isEntitySectionValid:boolean,
	isAliasEditorEmpty:boolean,
	isIdentifierEditorEmpty:boolean
};

export type EntityModalBodyOwnProps = {
    onModalSubmit:(e)=>unknown,
    entityType:string,
	validate:(arg)=>unknown,
	identifierTypes:IdentifierType[],
	children?: React.ReactElement
};
export type EntityModalDispatchProps = {
	onAliasClose: () => unknown,
	onIdentifierClose: () => unknown
};

export type EntityModalBodyProps = EntityModalDispatchProps & EntityModalBodyOwnProps & EntityModalStateProps;

export type CreateEntityModalOwnProps = {
	handleClose:() => unknown,
	allIdentifierTypes?:Array<IdentifierType>,
	handleSubmit:(e)=> unknown,
	type:string,
	show:boolean
};
export type CreateEntityModalProps = CreateEntityModalOwnProps;

export type SummarySectionStateProps = {
	Authors: Array<any>;
	EditionGroups: Array<any>;
	Editions: Array<any>;
	Publishers: Array<any>;
	Series: Array<any>;
	Works: Array<any>;
};
export type SummarySectionOwnProps = {
	languageOptions: any[]
};
export type SummarySectionProps = SummarySectionOwnProps & SummarySectionStateProps;

export type WorkRowStateProps = {
    work: any;
};
export type WorkRowDispatchProps = {
    onChange: (value:any) => void;
    onRemove: () => void;
	onToggle: () => void;
};

export type WorkRowOwnProps = {
	onCopyHandler:(arg)=>unknown,
    rowId: string;
};

export type WorkRowProps = WorkRowStateProps & WorkRowDispatchProps & WorkRowOwnProps;

export type SingleEntityCardProps = {
    entity:any,
	languageOptions:any[]
};
