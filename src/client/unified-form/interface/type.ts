
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
    identifierTypes:IdentifierType[],
    validators:Record<string, any>,
} & UnifiedFormDispatchProps;

export type CoverOwnProps = {
    languageOptions: LanguageOption[],
	editionFormats:EditionFormat[],
	identifierTypes:IdentifierType[]
	editionStatuses: EditionStatus[]
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

type EntitySelect = {
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
