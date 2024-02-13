import { join } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfig from './tsconfig.paths.json';

const tsPaths = tsConfig.compilerOptions.paths;
const ROOT = __dirname;

const alias = Object.keys(tsPaths).reduce(
	(pathMap, key) => ({
		...pathMap,
		[key.replace(/\*$/, '')]: join(
			ROOT,
			tsConfig.compilerOptions.baseUrl,
			tsPaths[key][0].replace(/^\.\//, '/').replace(/\*$/, '')
		),
	}),
	{}
);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias,
	},
});
