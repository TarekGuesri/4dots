import classNames from 'classnames';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

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
		'px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300',
		{
			'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-purple-500/50 hover:shadow-purple-500/75 transform hover:scale-105 active:scale-95':
				variant === 'primary' && !disabled,
			'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-slate-500/50 hover:shadow-slate-500/75 transform hover:scale-105 active:scale-95':
				variant === 'secondary' && !disabled,
			'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-red-500/50 hover:shadow-red-500/75 transform hover:scale-105 active:scale-95':
				variant === 'danger' && !disabled,
			'opacity-50 cursor-not-allowed': disabled,
			'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-purple-500/50':
				variant === 'primary' && disabled,
			'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-500/50':
				variant === 'secondary' && disabled,
			'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/50':
				variant === 'danger' && disabled,
		},
		className,
	);

	return (
		<button className={buttonClasses} disabled={disabled} {...rest}>
			{children}
		</button>
	);
}
