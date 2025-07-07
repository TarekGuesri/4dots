module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	ignorePatterns: ['vite.config.ts'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'react', 'import'],
	rules: {
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/ban-ts-comment': 'off',
		'import/no-named-as-default': 'off',
		'react/jsx-curly-brace-presence': 'error',
		'import/order': [
			'error',
			{
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
					'object',
					'type',
				],
				'newlines-between': 'always',
				alphabetize: { order: 'asc', caseInsensitive: true },
			},
		],
		'import/newline-after-import': 'error',
	},
	settings: {
		react: {
			version: 'detect',
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
			typescript: {
				project: ['packages/client/tsconfig.json'],
			},
		},
	},
};
