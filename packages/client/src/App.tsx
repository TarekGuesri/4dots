import { useAtomValue } from 'jotai';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RouteMap } from '@constants/RouteMap';
import { HomePage, NotFoundPage, RoomPage } from '@pages/pageListAsync';
import { ModalTypeAtom } from '@state/ui';
import { RulesModal } from '@molecules/RulesModal/RulesModal';

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
	const modalType = useAtomValue(ModalTypeAtom);

	return (
		<div className='bg-neutral-800 min-h-screen w-full h-full flex items-center justify-center'>
			<RouterProvider router={router} />
			{modalType === 'RULES' && <RulesModal />}
		</div>
	);
}

export default App;
