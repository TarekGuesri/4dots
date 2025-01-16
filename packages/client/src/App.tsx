import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RouteMap } from '@constants/RouteMap';
import { HomePage, NotFoundPage, RoomPage } from '@pages/pageListAsync';

const router = createBrowserRouter([
	{
		path: RouteMap.Public.index,
		element: <HomePage />,
	},
	{
		path: RouteMap.Public.room,
		element: <RoomPage />,
	},
	{
		path: '*',
		element: <NotFoundPage />,
	},
]);

function App() {
	console.log('App Render');

	return <RouterProvider router={router} />;
}

export default App;
