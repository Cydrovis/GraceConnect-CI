import React, { useState } from 'react';
import { AppUser } from '../types';
import { XMarkIcon, PlusIcon, TrashIcon } from './icons/HeroIcons';

export interface MinutesData {
    title: string;
    meetingDate: string;
    attendees: string[]; // member IDs
    agenda: string;
    decisions: string;
    actionPoints: { text: string; responsibleId: string }[];
}

interface CreateMinutesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MinutesData) => void;
    appUsers: AppUser[];
}

const CreateMinutesModal: React.FC<CreateMinutesModalProps> = ({ isOpen, onClose, onSave, appUsers }) => {
    const [title, setTitle] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendees, setAttendees] = useState<string[]>([]);
    const [agenda, setAgenda] = useState('');
    const [decisions, setDecisions] = useState('');
    const [actionPoints, setActionPoints] = useState<{ _id: string, text: string, responsibleId: string }[]>([]);

    if (!isOpen) return null;

    const handleAddActionPoint = () => {
        setActionPoints([...actionPoints, { _id: `ap_${Date.now()}`, text: '', responsibleId: '' }]);
    };
    
    const handleActionPointChange = (index: number, field: 'text' | 'responsibleId', value: string) => {
        const newPoints = [...actionPoints];
        (newPoints[index] as any)[field] = value;
        setActionPoints(newPoints);
    };

    const handleRemoveActionPoint = (index: number) => {
        setActionPoints(actionPoints.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            meetingDate,
            attendees,
            agenda,
            decisions,
            actionPoints: actionPoints.map(({ _id, ...rest }) => rest)
        });
        // The parent component will close after PDF generation
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Créer un Procès-Verbal</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la réunion</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de la réunion</label>
                                <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                            <select
                                multiple
                                value={attendees}
                                onChange={e => setAttendees(Array.from(e.target.selectedOptions, option => option.value))}
                                className="w-full h-32 p-2 border rounded-md"
                            >
                                {appUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs personnes.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ordre du jour</label>
                            <textarea value={agenda} onChange={e => setAgenda(e.target.value)} rows={4} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Décisions prises</label>
                            <textarea value={decisions} onChange={e => setDecisions(e.target.value)} rows={4} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Actions à mener</label>
                            <div className="space-y-2">
                                {actionPoints.map((point, index) => (
                                    <div key={point._id} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                                        <input
                                            value={point.text}
                                            onChange={e => handleActionPointChange(index, 'text', e.target.value)}
                                            placeholder="Description de l'action"
                                            className="flex-grow p-2 border rounded-md"
                                        />
                                        <select
                                            value={point.responsibleId}
                                            onChange={e => handleActionPointChange(index, 'responsibleId', e.target.value)}
                                            className="w-1/3 p-2 border rounded-md bg-white"
                                        >
                                            <option value="">-- Responsable --</option>
                                            {appUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                        <button type="button" onClick={() => handleRemoveActionPoint(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleAddActionPoint} className="mt-2 text-sm flex items-center gap-1 text-blue-600 hover:underline"><PlusIcon className="w-4 h-4"/>Ajouter une action</button>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t sticky bottom-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 border-transparent rounded-md text-white bg-church-dark-blue">Générer le PDF</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CreateMinutesModal;