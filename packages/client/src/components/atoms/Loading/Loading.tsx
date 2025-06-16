export function Loading() {
	return (
		<div className='relative w-12 h-12'>
			<div className='absolute w-full h-full border-4 border-blue-700 rounded-full'></div>
			<div className='absolute w-full h-full border-4 border-t-blue-400 rounded-full animate-spin'></div>
		</div>
	);
}
