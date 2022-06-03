type IdentifierType = {
    id:number,
    entityType:string
};
export type UnifiedFormProps = {
    identifierTypes:IdentifierType[],
    validators:Record<string, any>
};
