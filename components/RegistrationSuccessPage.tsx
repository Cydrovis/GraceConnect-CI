import React, { useState } from 'react';
import { ClipboardDocumentCheckIcon } from './icons/HeroIcons';

interface RegistrationSuccessPageProps {
    identifiant: string;
    name: string;
    onClose: () => void;
}

const RegistrationSuccessPage: React.FC<RegistrationSuccessPageProps> = ({ identifiant, name, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyAndContinue = () => {
        navigator.clipboard.writeText(identifiant).then(() => {
            setCopied(true);
            // Automatically redirect after a short delay
            setTimeout(() => {
                onClose();
            }, 1000); // 1 second delay
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Still proceed even if copy fails
            onClose();
        });
    };

    return (
        <div className="fixed inset-0 bg-church-bg dark:bg-gray-900 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-church-dark-teal dark:text-blue-400">Inscription réussie !</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Bienvenue, <span className="font-semibold">{name}</span>. Votre compte a été créé avec succès.
                </p>

                <div className="my-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Votre identifiant de connexion est :</p>
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-widest">
                        {identifiant}
                    </div>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Votre mot de passe par défaut est : <strong className="font-mono">grace</strong>. Il vous sera demandé de le modifier lors de votre première connexion.</p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Cet identifiant est essentiel pour vous connecter à l'application. Conservez-le en lieu sûr.
                </p>

                <button
                    onClick={handleCopyAndContinue}
                    className="w-full bg-church-green hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                    {copied ? (
                        <>
                            <ClipboardDocumentCheckIcon className="w-6 h-6" />
                            Identifiant Copié !
                        </>
                    ) : (
                         <>
                            <ClipboardDocumentCheckIcon className="w-6 h-6" />
                            Copier mon identifiant et continuer
                        </>
                    )}
                </button>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Vous serez redirigé vers la page de connexion après avoir copié l'identifiant.
                </p>
            </div>
        </div>
    );
};

export default RegistrationSuccessPage;
