import React, { useState } from 'react';
import { PaymentRequest, PaymentMethodConfig } from '../types';
import { XMarkIcon, CheckCircleIcon, InformationCircleIcon, UserIcon, EnvelopeIcon, BuildingOffice2Icon, HashtagIcon } from './icons/HeroIcons';
import { useData } from '../contexts';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: Omit<PaymentRequest, 'id' | 'requestDate' | 'status'>) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { platformSettings } = useData();
    const [step, setStep] = useState(1); // 1: Select method, 2: Form/QR, 3: Success
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodConfig | null>(null);
    const [formData, setFormData] = useState({ churchName: '', applicantName: '', applicantEmail: '', transactionId: '' });

    const handleSelectMethod = (method: PaymentMethodConfig) => {
        setSelectedMethod(method);
        setStep(2);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWaveInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Just validate the fields are filled before showing QR code
        if(formData.churchName && formData.applicantName && formData.applicantEmail) {
            setStep(2.5); // Move to QR code step
        } else {
            alert("Veuillez remplir toutes les informations avant de continuer.");
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethod) return;
        const requestData: Omit<PaymentRequest, 'id' | 'requestDate' | 'status'> = {
            churchName: formData.churchName,
            applicantName: formData.applicantName,
            applicantEmail: formData.applicantEmail,
            paymentMethod: selectedMethod.name,
        };

        if (selectedMethod.transactionIdRequired) {
            requestData.transactionId = formData.transactionId;
        }

        onSubmit(requestData);
        setStep(3);
    };

    const handleCloseAndReset = () => {
        onClose();
        setTimeout(() => {
            setStep(1);
            setSelectedMethod(null);
            setFormData({ churchName: '', applicantName: '', applicantEmail: '', transactionId: '' });
        }, 300); // delay reset to avoid flicker
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={handleCloseAndReset}>
            <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Abonnement GraceConnect</h2>
                    <button onClick={handleCloseAndReset} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <div>
                            <h3 className="font-semibold text-center mb-1">Accès complet pour 1 an</h3>
                            <p className="text-3xl font-bold text-center text-orange-600 mb-4">120 000 FCFA</p>
                            <p className="text-sm text-center text-gray-500 mb-6">Choisissez votre moyen de paiement pour commencer.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {platformSettings.paymentMethods.map(method => (
                                    <button key={method.name} onClick={() => handleSelectMethod(method)} className="p-4 border rounded-lg hover:shadow-lg hover:border-orange-500 transition-all flex flex-col items-center justify-center gap-2 h-32">
                                        <img src={method.logoUrl} alt={method.name} className="w-10 h-10 object-contain"/>
                                        <span className="font-semibold">{method.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedMethod && (
                        <form onSubmit={selectedMethod.transactionIdRequired ? handleSubmit : handleWaveInfoSubmit}>
                             <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 mb-4">&larr; Changer de moyen de paiement</button>
                            <div className="p-4 bg-gray-100 rounded-lg mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={selectedMethod.logoUrl} alt={selectedMethod.name} className="w-10 h-10 object-contain"/>
                                    <div>
                                        <h3 className="font-bold">{selectedMethod.name}</h3>
                                        <p className="text-lg font-mono font-semibold">{selectedMethod.number}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">{selectedMethod.details}</p>
                            </div>
                            <p className="text-sm text-center text-gray-600 mb-4 font-semibold">Veuillez remplir les informations ci-dessous après avoir effectué le paiement.</p>
                            <div className="space-y-4">
                                 <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><BuildingOffice2Icon className="w-5 h-5"/></span><input name="churchName" placeholder="Nom de l'église" onChange={handleChange} value={formData.churchName} required className="w-full pl-10 pr-3 py-2 border rounded-md" /></div>
                                 <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><UserIcon className="w-5 h-5"/></span><input name="applicantName" placeholder="Votre nom complet" onChange={handleChange} value={formData.applicantName} required className="w-full pl-10 pr-3 py-2 border rounded-md" /></div>
                                 <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><EnvelopeIcon className="w-5 h-5"/></span><input name="applicantEmail" type="email" placeholder="Votre email" onChange={handleChange} value={formData.applicantEmail} required className="w-full pl-10 pr-3 py-2 border rounded-md" /></div>
                                 {selectedMethod.transactionIdRequired && (
                                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><HashtagIcon className="w-5 h-5"/></span><input name="transactionId" placeholder="ID de la transaction" onChange={handleChange} value={formData.transactionId} required className="w-full pl-10 pr-3 py-2 border rounded-md" /></div>
                                 )}
                            </div>
                            <button type="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">{selectedMethod.transactionIdRequired ? 'Confirmer le paiement' : 'Continuer'}</button>
                        </form>
                    )}

                    {step === 2.5 && selectedMethod && (
                        <form onSubmit={handleSubmit}>
                             <button type="button" onClick={() => setStep(2)} className="text-sm text-blue-600 mb-4">&larr; Retour</button>
                             <h3 className="text-lg font-semibold text-center">Paiement via {selectedMethod.name}</h3>
                             <p className="text-center text-sm text-gray-600 mb-4">Scannez le code QR ci-dessous avec votre application pour effectuer le paiement de <strong>120 000 FCFA</strong>.</p>
                             <div className="flex justify-center my-4">
                                <div 
                                    className="bg-gray-50 border rounded-lg p-4 flex flex-col items-center justify-center mx-auto"
                                    style={{ width: '380px', height: '520px', maxWidth: '100%' }}
                                >
                                    {selectedMethod.qrCodeUrl ? 
                                        <img src={selectedMethod.qrCodeUrl} alt="Wave QR Code" className="w-full max-w-[320px] h-auto aspect-square object-contain" />
                                        : <div className="w-full max-w-[320px] aspect-square border p-2 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center">QR Code non disponible.</div>
                                    }
                                    <p className="text-xs text-center text-gray-500 mt-4">Pointez votre caméra sur ce code pour payer.</p>
                                </div>
                             </div>
                             <p className="text-xs text-center text-gray-500 mb-4">Une fois le paiement effectué, cliquez sur le bouton ci-dessous pour soumettre votre demande d'inscription.</p>
                             <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">J'ai payé, soumettre ma demande</button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center p-4">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                            <h3 className="text-xl font-bold">Demande Envoyée !</h3>
                            <p className="text-gray-600 mt-2">Votre demande de paiement a été envoyée. Vous recevrez votre code d'inscription par email une fois le paiement validé par l'administrateur.</p>
                             <p className="text-xs text-gray-500 mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                               <InformationCircleIcon className="w-4 h-4 inline-block mr-1"/> La validation peut prendre jusqu'à 24 heures.
                            </p>
                            <button onClick={handleCloseAndReset} className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition">Fermer</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;