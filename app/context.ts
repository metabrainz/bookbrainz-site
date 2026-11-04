import type {Alert, MergeQueue, SiteSession, SiteUser} from '../src/common/types/site';
import type {Backend} from '../src/backend';
import {createContext} from 'react-router';


export type SiteContext = {
	alerts: Alert[],
	backend: Backend,
	mergeQueue?: MergeQueue | null,
	repositoryUrl: string,
	session: SiteSession | undefined,
	signUpDisabled: boolean,
	siteRevision: string,
	user?: SiteUser
};

// Missing request initialization must fail instead of returning fabricated defaults.
export const siteContext = createContext<SiteContext>();
