import { BOARD_SIZE } from '@constants/BoardSettings';
import { BoardCol } from '@organisms/BoardCol';

const columns = Array(BOARD_SIZE.columns).fill(null);

export function Board() {
	return (
		<div>
			<div className='bg-red-500 w-[950px] h-[750px] flex justify-center items-center'>
				<div className='bg-sky-500 w-[450px] h-[450px] flex flex-row flex-nowrap'>
					{columns.map((_, index) => (
						<BoardCol key={index} colId={index} />
					))}
				</div>
			</div>
		</div>
	);
}
