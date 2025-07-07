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
		<div className='min-h-screen w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden'>
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
				<div className='absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>
			</div>

			<div className='relative z-10 w-full'>
				<RouterProvider router={router} />
			</div>

			{modalType === 'RULES' && <RulesModal />}
		</div>
	);
}

export default App;
