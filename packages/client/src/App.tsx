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

	return (
		<div className='bg-neutral-800 h-screen'>
			<RouterProvider router={router} />
		</div>
	);
}

export default App;
