import { Close as CloseIcon } from '@mui/icons-material';

import { Button } from '@molecules/Button/Button';

import type { ModalType } from '@4dots/shared';

interface RoomModalProps {
	modalMessage: string;
	modalType: ModalType;
	handleLeave: () => void;
	closeModal: () => void;
}

export function RoomModal(props: RoomModalProps) {
	const { modalMessage, modalType, handleLeave, closeModal } = props;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm'>
			<div className='glass animate-bounce-in mx-4 w-full max-w-md rounded-2xl p-6 sm:p-8'>
				<div className='mb-4 flex items-center justify-between sm:mb-6'>
					<h2 className='text-xl font-bold text-slate-200 sm:text-2xl'>
						⚠️ Error
					</h2>
					<button
						onClick={closeModal}
						className='text-slate-400 transition-colors hover:text-slate-200'
					>
						<CloseIcon />
					</button>
				</div>
				<p className='mb-6 text-base leading-relaxed text-slate-300 sm:mb-8 sm:text-lg'>
					{modalMessage}
				</p>
				<div className='flex justify-end gap-3 sm:gap-4'>
					{modalType === 'Error.VisitorLeft' ? (
						<Button variant='danger' onClick={handleLeave}>
							Leave Room
						</Button>
					) : (
						<Button onClick={closeModal}>Close</Button>
					)}
				</div>
			</div>
		</div>
	);
}
