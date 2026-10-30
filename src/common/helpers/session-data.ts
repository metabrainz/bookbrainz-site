// eslint-disable-next-line import/no-unassigned-import -- load the module being augmented
import type {} from 'express-session';
import type {MergeQueue} from '../types/site';

// Values persisted by Express and read by loaders.
declare module 'express-session' {
	interface SessionData {
		mergeQueue?: MergeQueue | null;
		redirectTo?: string;
	}
}
