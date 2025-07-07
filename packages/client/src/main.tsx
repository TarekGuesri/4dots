import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppProviders } from '@atoms/AppProviders';

import App from './App';
import './index.css';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppProviders>
			<App />
		</AppProviders>
	</React.StrictMode>,
);
