interface DiskProps extends React.HTMLAttributes<HTMLDivElement> {
	color: string;
	width?: number;
	height?: number;
	hasShadow?: boolean;
}

export function Disk({
	color,
	width,
	height,
	style,
	hasShadow,
	...props
}: DiskProps) {
	return (
		<div
			className={`${color} rounded-full w-[85%] aspect-square`}
			style={{
				...(width && height
					? { width: `${width}px`, height: `${height}px` }
					: {}),
				boxShadow: hasShadow ? 'inset 0 4px 6px rgba(0, 0, 0, 0.9)' : 'none',
				...style,
			}}
			{...props}
		/>
	);
}
