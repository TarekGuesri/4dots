import { useAtomValue } from 'jotai';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { RouteMap } from '@constants/RouteMap';
import { RulesModal } from '@molecules/RulesModal/RulesModal';
import { HomePage, NotFoundPage, RoomPage } from '@pages/pageListAsync';
import { ModalTypeAtom } from '@state/ui';

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
		<div className='relative flex h-full min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
			<div className='absolute inset-0 overflow-hidden'>
				<div className='animate-blob absolute -right-40 -top-40 h-80 w-80 rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
				<div className='animate-blob animation-delay-2000 absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
				<div className='animate-blob animation-delay-4000 absolute left-40 top-40 h-80 w-80 rounded-full bg-pink-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
			</div>

			<div className='relative z-10 w-full'>
				<RouterProvider router={router} />
			</div>

			{modalType === 'RULES' && <RulesModal />}
		</div>
	);
}

export default App;
