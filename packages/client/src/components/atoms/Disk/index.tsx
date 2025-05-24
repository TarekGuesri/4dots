interface DiskProps {
	color: string;
	width?: number;
	height?: number;
}

export function Disk({ color, width = 45, height = 45 }: DiskProps) {
	return (
		<div
			className={`${color} rounded-full`}
			style={{ width: `${width}px`, height: `${height}px` }}
		/>
	);
}
