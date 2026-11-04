import type {ComponentType} from 'react';


export type PublicError = {
	detailedMessage?: string | string[],
	message: string,
	status: number
};

declare const ErrorPage: ComponentType<{error: PublicError}>;
export default ErrorPage;
