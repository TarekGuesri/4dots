export function Loading() {
	return (
		<div className='relative h-12 w-12'>
			<div className='absolute h-full w-full rounded-full border-4 border-blue-700'></div>
			<div className='absolute h-full w-full animate-spin rounded-full border-4 border-t-blue-400'></div>
		</div>
	);
}
