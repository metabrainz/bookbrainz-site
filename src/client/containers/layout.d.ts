import type {Alert, MergeQueue, SiteUser} from '../../common/types/site';
import type {ComponentType, ReactNode} from 'react';


export type LayoutProps = {
	alerts: Alert[],
	children: ReactNode,
	disableSignUp?: boolean,
	hideSearch?: boolean,
	homepage?: boolean,
	mergeQueue?: MergeQueue | null,
	repositoryUrl: string,
	requiresJS?: boolean,
	siteRevision: string,
	user?: SiteUser
};

declare const Layout: ComponentType<LayoutProps>;
export default Layout;
