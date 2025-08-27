import React from 'react';
import { ExclamationTriangleIcon } from './icons/HeroIcons';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-theme-text-base">Confirmer la déconnexion</h3>
                    <div className="mt-2">
                        <p className="text-sm text-theme-text-muted">
                            Voulez-vous vraiment vous déconnecter de GraceConnect ?
                        </p>
                    </div>
                </div>
                <div className="bg-theme-table-header px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-xl">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onConfirm}
                    >
                        Déconnexion
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-theme-border shadow-sm px-4 py-2 bg-theme-card text-base font-medium text-theme-text-base hover:bg-theme-bg sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;
