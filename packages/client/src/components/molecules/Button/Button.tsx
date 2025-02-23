import type { ReactNode, ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	disabled?: boolean;
	className?: string;
	variant?: 'primary' | 'secondary' | 'danger'; // Add variant prop
}

export function Button({
	children,
	disabled = false,
	className = '',
	variant = 'primary',
	...rest
}: ButtonProps) {
	const buttonClasses = classNames(
		'px-4 py-2 font-semibold rounded-lg', // Base classes
		{
			'bg-blue-500 text-white hover:bg-blue-600':
				variant === 'primary' && !disabled,
			'bg-gray-500 text-white hover:bg-gray-600':
				variant === 'secondary' && !disabled,
			'bg-red-500 text-white hover:bg-red-600':
				variant === 'danger' && !disabled,
			'opacity-50 cursor-not-allowed': disabled,
			'bg-blue-500 text-white': variant === 'primary' && disabled,
			'bg-gray-500 text-white': variant === 'secondary' && disabled,
			'bg-red-500 text-white': variant === 'danger' && disabled,
		},
		className
	);

	return (
		<button className={buttonClasses} disabled={disabled} {...rest}>
			{children}
		</button>
	);
}
