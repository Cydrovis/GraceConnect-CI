import React, { useState, useEffect } from 'react';
import { Member, AppUser, FollowUp } from '../types';
import { XMarkIcon } from './icons/HeroIcons';

const FOLLOW_UP_TYPES: FollowUp['type'][] = ['Appel', 'Visite', 'Message', 'Rencontre', 'Autre'];
const FOLLOW_UP_OUTCOMES: FollowUp['outcome'][] = ['Contacté', 'Pas de réponse', 'Visité', 'Promesse de retour', 'Raison personnelle', 'Autre'];

interface MemberFollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (followUpData: Omit<FollowUp, 'id' | 'followedUpById'>) => void;
    member: Member | null;
    currentUser: AppUser;
    followUps: FollowUp[];
    appUsers: AppUser[];
}

const MemberFollowUpModal: React.FC<MemberFollowUpModalProps> = ({ isOpen, onClose, onSave, member, currentUser, followUps, appUsers }) => {
    const [type, setType] = useState(FOLLOW_UP_TYPES[0]);
    const [outcome, setOutcome] = useState(FOLLOW_UP_OUTCOMES[0]);
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setType(FOLLOW_UP_TYPES[0]);
            setOutcome(FOLLOW_UP_OUTCOMES[0]);
            setNotes('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen || !member) return null;

    const memberFollowUps = followUps
        .filter(f => f.memberId === member.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            memberId: member.id,
            date,
            type: type,
            outcome: outcome,
            notes,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <img src={member.photoUrl} alt="member" className="w-12 h-12 rounded-full" />
                        <div>
                            <h2 className="text-xl font-bold text-theme-text-base">Suivi de {member.firstName} {member.lastName}</h2>
                            <p className="text-sm text-theme-text-muted">Statut actuel: <span className="font-semibold">{member.status}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                    {/* Form part */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold text-theme-text-base">Nouvelle action de suivi</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type d'interaction</label>
                            <select value={type} onChange={e => setType(e.target.value as FollowUp['type'])} className="w-full">
                                {FOLLOW_UP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Résultat</label>
                            <select value={outcome} onChange={e => setOutcome(e.target.value as FollowUp['outcome'])} className="w-full">
                                {FOLLOW_UP_OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} required className="w-full" placeholder="Détails de l'interaction..."></textarea>
                        </div>
                        <div className="pt-2">
                             <button type="submit" className="w-full btn btn-primary">Enregistrer l'action</button>
                        </div>
                    </form>

                    {/* History part */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-theme-text-base">Historique des suivis</h3>
                        <div className="bg-theme-bg border border-theme-border rounded-lg p-3 space-y-3 h-full overflow-y-auto">
                            {memberFollowUps.length > 0 ? (
                                memberFollowUps.map(f => {
                                    const follower = appUsers.find(u => u.id === f.followedUpById);
                                    return (
                                        <div key={f.id} className="p-3 bg-theme-card border border-theme-border rounded-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-theme-text-base">{f.type} - {f.outcome}</p>
                                                    <p className="text-xs text-theme-text-muted">le {new Date(f.date).toLocaleDateString('fr-FR')} par {follower?.name || 'Inconnu'}</p>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-theme-text-muted italic">"{f.notes}"</p>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center text-sm text-theme-text-muted py-10">
                                    Aucun suivi enregistré pour ce membre.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberFollowUpModal;