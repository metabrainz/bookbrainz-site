// eslint-disable-next-line import/no-unassigned-import -- load the module being augmented
import type {} from 'express-session';
import type {MergeQueue, MetaBrainzProfile} from '../types/site';

// Values persisted by Express and read by loaders.
declare module 'express-session' {
	interface SessionData {
		mbProfile?: MetaBrainzProfile;
		mergeQueue?: MergeQueue | null;
		redirectTo?: string;
	}
}
