import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useData } from '../contexts';
import { KeyIcon, InformationCircleIcon } from './icons/HeroIcons';

const AwaitingActivationPage: React.FC = () => {
    const { pendingRequestId, handleActivateWithCode, activationError, setSessionState } = useAuth();
    const { paymentRequests } = useData();
    const [activationCode, setActivationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef<number | null>(null);

    // Polling logic
    useEffect(() => {
        if (pendingRequestId) {
            const checkCode = () => {
                const request = paymentRequests.find(p => p.id === pendingRequestId);
                if (request?.generatedCode) {
                    setActivationCode(request.generatedCode);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            }
            // Check immediately
            checkCode();

            // Start polling if no code yet
            if (!activationCode) {
                 intervalRef.current = window.setInterval(checkCode, 5000); // Poll every 5 seconds
            }
        }

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [pendingRequestId, paymentRequests, activationCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await handleActivateWithCode(activationCode);
        setIsLoading(false);
    };

    const isAwaitingPayment = !!pendingRequestId;

    return (
        <div 
            className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white" 
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507919381536-213c5e01a12a?q=80&w=2070&auto=format&fit=crop)' }}
        >
            <div className="min-h-screen w-full bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold text-white">
                        {isAwaitingPayment ? "Demande d'inscription soumise !" : "Activer votre compte"}
                    </h2>
                    
                    {isAwaitingPayment && (
                        <p className="text-gray-200 my-4">
                            Une fois votre paiement validé par un administrateur, votre code d'activation apparaîtra automatiquement ci-dessous.
                        </p>
                    )}

                    {!isAwaitingPayment && (
                         <p className="text-gray-200 my-4">Entrez le code d'activation que vous avez reçu pour activer votre compte.</p>
                    )}

                    {activationError && <div className="bg-red-500/80 text-white p-3 rounded-md my-4 text-sm">{activationError}</div>}
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="flex items-center gap-3 w-full rounded-full bg-white py-3 px-4 focus-within:ring-2 focus-within:ring-orange-500">
                            <span className="text-orange-500 flex-shrink-0">
                                <KeyIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Code d'activation"
                                value={activationCode}
                                onChange={e => setActivationCode(e.target.value)}
                                className="w-full border-0 bg-transparent p-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading || !activationCode} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isLoading ? 'Activation en cours...' : 'Activer mon compte'}
                        </button>
                    </form>
                     <div className="text-center mt-6">
                        <button onClick={() => setSessionState('loggedOut')} className="text-sm text-yellow-400 hover:underline">Retour à la connexion</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AwaitingActivationPage;