import { useWebsocket } from '@hooks/useWebSocket';
import { Board } from '@templates/Board';

function App() {
	useWebsocket();

	return (
		<>
			<Board />
		</>
	);
}

export default App;
