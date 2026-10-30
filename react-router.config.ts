/* eslint-disable import/no-unresolved, node/no-missing-import */
import type {Config} from '@react-router/dev/config';


export default {
	buildDirectory: 'build-router',
	serverBuildFile: '[name].mjs',
	ssr: true
} satisfies Config;
