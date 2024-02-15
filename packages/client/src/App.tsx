import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RouteMap } from '@constants/RouteMap';
import { useWebsocket } from '@hooks/useWebSocket';
import { HomePage, NotFoundPage } from '@pages/pageListAsync';

const router = createBrowserRouter([
	{
		path: RouteMap.Public.index,
		element: <HomePage />,
	},
	{
		path: '*',
		element: <NotFoundPage />,
	},
]);

function App() {
	useWebsocket();

	return <RouterProvider router={router} />;
}

export default App;
