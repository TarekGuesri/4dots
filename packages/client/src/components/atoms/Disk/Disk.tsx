import classNames from 'classnames';

interface DiskProps extends React.HTMLAttributes<HTMLDivElement> {
	color: string;
	width?: number;
	height?: number;
	hasShadow?: boolean;
	isWinner?: boolean;
}

export function Disk({
	color,
	width,
	height,
	style,
	hasShadow,
	isWinner = false,
	className = '',
	...props
}: DiskProps) {
	const getDiskStyle = () => {
		if (color === 'bg-red-500') {
			return 'bg-gradient-to-br from-red-400 to-red-600';
		}
		if (color === 'bg-yellow-500') {
			return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
		}
		return color;
	};

	return (
		<div
			className={classNames(
				getDiskStyle(),
				'rounded-full aspect-square transition-all duration-300',
				isWinner ? 'animate-winner-glow' : '',
				className
			)}
			style={{
				...(width && height
					? { width: `${width}px`, height: `${height}px` }
					: {}),
				boxShadow: hasShadow
					? 'inset 0 4px 6px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.3)'
					: '0 2px 4px rgba(0, 0, 0, 0.3)',
				...style,
			}}
			{...props}
		/>
	);
}
