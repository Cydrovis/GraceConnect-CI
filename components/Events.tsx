

import React, { useState, useMemo } from 'react';
import { CalendarDaysIcon, PlusIcon, ClockIcon, MapPinIcon, UsersIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon, PencilIcon, ArrowPathIcon, ArchiveBoxIcon, ClipboardDocumentCheckIcon, TrashIcon } from './icons/HeroIcons';
import { ChurchEvent, Member, Group } from '../types';
import EventFormModal from './EventFormModal';
import { useChurch } from '../contexts';

const findMemberById = (id: string, members: Member[]): Member | undefined => members.find(m => m.id === id);

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'Culte régulier': return 'bg-indigo-500';
        case 'Réunion': return 'bg-blue-500';
        case 'Conférence': return 'bg-purple-500';
        case 'Séminaire': return 'bg-pink-500';
        case 'Formation': return 'bg-teal-500';
        case 'Veillée': return 'bg-amber-500';
        case 'Croisade': return 'bg-red-500';
        case 'Retraite': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, icon, defaultOpen = false }) => (
    <details className="bg-theme-card rounded-lg border border-theme-border group" open={defaultOpen}>
        <summary className="p-4 font-semibold text-theme-text-base cursor-pointer flex items-center gap-3 list-none group-open:border-b group-open:border-theme-border">
             {icon}
             <span className="flex-1">{title}</span>
             <ChevronRightIcon className="w-5 h-5 transform transition-transform group-open:rotate-90" />
        </summary>
        <div className="p-4 text-sm text-theme-text-muted">
            {children}
        </div>
    </details>
);

const EventDetailModal: React.FC<{
    event: ChurchEvent | null;
    onClose: () => void;
    members: Member[];
    onCancel: (event: ChurchEvent) => void;
    onEdit: (event: ChurchEvent) => void;
    onDelete: (eventId: string) => void;
    currency: string;
}> = ({ event, onClose, members, onCancel, onEdit, onDelete, currency }) => {
    const organizer = useMemo(() => {
        if (!event) return undefined;
        return findMemberById(event.organizerId || event.leaderId || '', members);
    }, [event, members]);
    
    const totalBudget = useMemo(() => event?.logistics?.budget?.reduce((sum, item) => sum + item.amount, 0) || 0, [event]);
    
    if (!event) return null;

    const handleCancelClick = () => {
        if (window.confirm("Êtes-vous sûr de vouloir annuler cet événement ?")) {
            onCancel(event);
        }
    };
    
    const handleDeleteClick = () => {
        onDelete(event.id);
        onClose();
    };

    const dateString = event.endDate 
        ? `Du ${new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${new Date(event.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : new Date(event.startDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className={`p-5 rounded-t-xl text-white ${getEventTypeColor(event.type)}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block text-xs uppercase tracking-wider">{event.type}</p>
                            <h2 className="text-2xl font-bold mt-2">{event.name}</h2>
                            <p className="text-white/90">{dateString}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-white/80 hover:bg-white/20"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </header>
                <div className="p-6 overflow-y-auto space-y-4 bg-theme-bg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-3 bg-theme-card rounded-lg border border-theme-border text-theme-text-base"><ClockIcon className="w-5 h-5 text-theme-accent"/><span>{event.startTime} - {event.endTime}</span></div>
                        <div className="flex items-center gap-2 p-3 bg-theme-card rounded-lg border border-theme-border text-theme-text-base"><MapPinIcon className="w-5 h-5 text-theme-accent"/><span>{event.location}</span></div>
                    </div>

                     <DetailSection title="Description & Objectif" icon={<DocumentTextIcon className="w-5 h-5 text-theme-text-muted" />} defaultOpen>
                        <p className="font-semibold text-theme-text-base">Objectif: <span className="font-normal italic">{event.objective || "Non spécifié"}</span></p>
                        <p className="mt-2">{event.description || "Aucune description fournie."}</p>
                        {event.recurrence && event.recurrence !== 'none' && (
                             <p className="mt-2 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-md">
                                <ArrowPathIcon className="w-4 h-4" />
                                <span>
                                    Événement récurrent ({
                                        {weekly: 'hebdomadaire', monthly: 'mensuel', yearly: 'annuel'}[event.recurrence]
                                    })
                                    {event.recurrenceEndDate && ` jusqu'au ${new Date(event.recurrenceEndDate).toLocaleDateString('fr-FR')}`}
                                </span>
                             </p>
                        )}
                    </DetailSection>

                    <DetailSection title="Participants & Accès" icon={<UsersIcon className="w-5 h-5 text-theme-text-muted" />}>
                        <div className="space-y-2">
                            <p><span className="font-medium text-theme-text-base">Public cible:</span> {event.targetAudience?.join(', ') || 'Non spécifié'}</p>
                            <p><span className="font-medium text-theme-text-base">Accès:</span> {event.accessType || 'Non spécifié'}</p>
                            <p><span className="font-medium text-theme-text-base">Participants attendus:</span> {event.expectedParticipants || 'Non spécifié'}</p>
                        </div>
                    </DetailSection>

                    <DetailSection title="Logistique, Ressources & Budget" icon={<ArchiveBoxIcon className="w-5 h-5 text-theme-text-muted" />}>
                        <h4 className="font-semibold mb-2 text-theme-text-base">Logistique</h4>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                            {event.logistics?.soundSystem && <li>Sonorisation prévue</li>}
                            {event.logistics?.videoStreaming && <li>Streaming vidéo prévu</li>}
                            {event.logistics?.receptionSecurity && <li>Service d'accueil / sécurité prévu</li>}
                        </ul>
                         {event.logistics?.resources && event.logistics.resources.length > 0 && <>
                            <h4 className="font-semibold mb-2 mt-4 text-theme-text-base">Ressources réservées</h4>
                            <div className="flex flex-wrap gap-2">
                                {event.logistics.resources.map(r => <span key={r} className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">{r}</span>)}
                            </div>
                         </>}
                         {event.logistics?.budget && event.logistics.budget.length > 0 && <>
                            <h4 className="font-semibold mb-2 mt-4 text-theme-text-base">Budget prévisionnel</h4>
                            <ul className="space-y-1">
                                {event.logistics.budget.map(b => (
                                    <li key={b.id} className="flex justify-between border-b border-theme-border py-1"><span>{b.category}</span><span className="font-medium">{b.amount.toLocaleString('fr-FR')} {currency}</span></li>
                                ))}
                                <li className="flex justify-between font-bold pt-1 text-theme-text-base"><span>Total</span><span>{totalBudget.toLocaleString('fr-FR')} {currency}</span></li>
                            </ul>
                         </>}
                    </DetailSection>

                    {event.tasks && event.tasks.length > 0 && (
                        <DetailSection title="Checklist des tâches" icon={<ClipboardDocumentCheckIcon className="w-5 h-5 text-theme-text-muted" />}>
                           <ul className="space-y-2">
                               {event.tasks.map(task => (
                                   <li key={task.id} className={`flex items-center gap-2 ${task.completed ? 'text-gray-400 line-through' : ''}`}>
                                       <input type="checkbox" checked={task.completed} readOnly className="h-4 w-4 rounded border-gray-300 text-church-teal focus:ring-church-light-teal" />
                                       <span>{task.text}</span>
                                   </li>
                               ))}
                           </ul>
                        </DetailSection>
                    )}
                </div>
                 <footer className="flex justify-between items-center p-4 bg-theme-table-header border-t border-theme-border rounded-b-xl space-x-3">
                    <button type="button" onClick={handleDeleteClick} className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm text-white bg-red-600 hover:bg-red-700">
                        <TrashIcon className="w-4 h-4" /> Supprimer
                    </button>
                    <div className="flex items-center space-x-3">
                        <button type="button" onClick={handleCancelClick} className="px-4 py-2 border border-theme-border rounded-md text-sm text-yellow-600 bg-theme-card hover:bg-yellow-50">Annuler l'événement</button>
                        <button type="button" onClick={() => onEdit(event)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm text-white bg-church-dark-blue hover:bg-blue-900">Modifier l'événement</button>
                    </div>
                </footer>
            </div>
        </div>
    )
};

const CalendarView: React.FC<{
    events: ChurchEvent[];
    onSelectEvent: (event: ChurchEvent) => void;
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    onDateSelect: (date: Date) => void;
}> = ({ events, onSelectEvent, currentDate, setCurrentDate, onDateSelect }) => {
    const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDateCal = new Date(monthStart);
    startDateCal.setDate(startDateCal.getDate() - monthStart.getDay());
    const endDateCal = new Date(monthEnd);
    endDateCal.setDate(endDateCal.getDate() + (6 - monthEnd.getDay()));

    const calendarDays = [];
    let day = new Date(startDateCal);
    while (day <= endDateCal) {
        calendarDays.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const eventsByDate = useMemo(() => {
        const map = new Map<string, ChurchEvent[]>();
        events.forEach(event => {
            const dateKey = event.startDate;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)?.push(event);
        });
        return map;
    }, [events]);

    const changeMonth = (offset: number) => {
        setCurrentDate(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    };

    const todayDateOnly = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    return (
        <div className="bg-theme-card p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-theme-text-base hover:bg-slate-100"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h3 className="text-xl font-bold text-theme-text-base">{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-theme-text-base hover:bg-slate-100"><ChevronRightIcon className="w-6 h-6"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-theme-text-muted">
                {days.map(d => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px border-t border-l border-theme-border bg-theme-border">
                {calendarDays.map((d, i) => {
                    const dateKey = d.toISOString().split('T')[0];
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                    const isToday = d.getTime() === todayDateOnly.getTime();
                    const isPast = d < todayDateOnly;
                    const isClickable = !isPast && isCurrentMonth;

                    return (
                        <div key={i} 
                             className={`p-2 h-32 flex flex-col bg-theme-card border-r border-b border-theme-border 
                                ${!isCurrentMonth ? 'bg-theme-bg opacity-60' : ''}
                                ${isClickable ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                             onClick={() => isClickable && onDateSelect(d)}>
                            <span className={`font-semibold ${isToday ? 'bg-theme-accent text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-theme-text-base'}`}>{d.getDate()}</span>
                            <div className="mt-1 overflow-y-auto space-y-1">
                                {dayEvents.map(event => (
                                    <button key={event.id} onClick={(e) => { e.stopPropagation(); onSelectEvent(event);}} className={`w-full text-left text-xs p-1 rounded transition-colors ${getEventTypeColor(event.type)} text-white`}>
                                        <p className="font-bold truncate">{event.name}</p>
                                        <p className="truncate">{event.startTime}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EventListItem: React.FC<{
    event: ChurchEvent;
    onSelect: (event: ChurchEvent) => void;
    onEdit: (event: ChurchEvent) => void;
}> = ({ event, onSelect, onEdit }) => {
    const statusStyles: { [key in ChurchEvent['status']]: string } = {
        'À venir': 'bg-blue-100 text-blue-800',
        'Passé': 'bg-gray-100 text-gray-800',
        'Annulé': 'bg-red-100 text-red-800 line-through decoration-red-800',
    };
    
    return (
        <div className={`flex items-center justify-between p-4 border-b border-theme-border hover:bg-slate-50 ${event.status === 'Annulé' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0 ${getEventTypeColor(event.type)}`}>
                    <span className="text-sm font-bold">{new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-2xl font-bold">{new Date(event.startDate).getDate()}</span>
                </div>
                <div className="flex-1">
                    <p className={`font-bold text-theme-text-base ${event.status === 'Annulé' ? 'line-through' : ''}`}>{event.name}</p>
                    <p className="text-sm text-theme-text-muted">{event.startTime} - {event.endTime} à {event.location}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-4">
                 <span className={`px-2 py-1 text-xs font-semibold rounded-full hidden md:inline-block ${statusStyles[event.status]}`}>{event.status}</span>
                <button onClick={() => onEdit(event)} className="p-2 text-theme-text-muted hover:bg-slate-200 rounded-full" title="Modifier">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onSelect(event)} className="p-2 text-theme-text-muted hover:bg-slate-200 rounded-full" title="Voir les détails">
                    <ChevronRightIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};


interface EventsProps {
    events: ChurchEvent[];
    members: Member[];
    groups: Group[];
    onSaveEvent: (event: Omit<ChurchEvent, 'id'> & { id?: string }) => void;
    onDeleteEvent: (eventId: string) => void;
}

const Events: React.FC<EventsProps> = ({ events, members, groups, onSaveEvent, onDeleteEvent }) => {
    const { currentChurch } = useChurch();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
    const [eventToEdit, setEventToEdit] = useState<ChurchEvent | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [initialDateForForm, setInitialDateForForm] = useState<string | undefined>(undefined);

    const handleOpenForm = (event: ChurchEvent | null = null) => {
        setEventToEdit(event);
        setInitialDateForForm(undefined);
        setFormModalOpen(true);
    };
    
    const handleCloseForm = () => {
        setFormModalOpen(false);
        setEventToEdit(null);
        setInitialDateForForm(undefined);
    }

    const handleDateSelect = (date: Date) => {
        setEventToEdit(null);
        setInitialDateForForm(date.toISOString().split('T')[0]);
        setFormModalOpen(true);
    };

    const handleSaveAndCloseForm = (eventData: Omit<ChurchEvent, 'id'> & { id?: string }) => {
        onSaveEvent(eventData);
        handleCloseForm();
    };

    const handleSelectEvent = (event: ChurchEvent) => {
        setSelectedEvent(event);
    };

    const handleEditFromDetail = (event: ChurchEvent) => {
        setSelectedEvent(null);
        handleOpenForm(event);
    };

    const handleDeleteFromDetail = (eventId: string) => {
        onDeleteEvent(eventId);
        setSelectedEvent(null);
    };
    
    const handleCancelEvent = (event: ChurchEvent) => {
        onSaveEvent({ ...event, status: 'Annulé' });
        setSelectedEvent(null);
    };

    const upcomingAndCancelledEvents = useMemo(() => {
        return events.filter(e => e.status === 'À venir' || e.status === 'Annulé').sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [events]);

    const pastEvents = useMemo(() => {
        return events.filter(e => e.status === 'Passé').sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [events]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-theme-text-base">Gestion des cultes et événements</h2>
                    <p className="mt-1 text-theme-text-muted">Planifiez, consultez et gérez tous les événements de l'église.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-200 rounded-lg flex text-sm font-semibold">
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Liste
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')} 
                            className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Calendrier
                        </button>
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="btn btn-primary bg-indigo-900 hover:bg-indigo-800 text-white font-semibold">
                        <PlusIcon className="w-5 h-5" />
                        Planifier
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-6">
                    <div className="bg-theme-card rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-theme-text-base p-6 border-b border-theme-border">Événements à venir & annulés</h3>
                        {upcomingAndCancelledEvents.length === 0 ? (
                            <div className="text-center text-theme-text-muted py-12">
                                Aucun événement à afficher.
                            </div>
                        ) : (
                           <div>
                               {upcomingAndCancelledEvents.map(event => (
                                   <EventListItem 
                                       key={event.id}
                                       event={event} 
                                       onSelect={handleSelectEvent} 
                                       onEdit={handleOpenForm} 
                                   />
                               ))}
                           </div>
                        )}
                    </div>
                     <div className="bg-theme-card rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-theme-text-base p-6 border-b border-theme-border">Événements passés</h3>
                        {pastEvents.length === 0 ? (
                            <div className="text-center text-theme-text-muted py-12">
                                Aucun événement à afficher.
                            </div>
                        ) : (
                           <div>
                                {pastEvents.map(event => (
                                   <EventListItem 
                                       key={event.id}
                                       event={event} 
                                       onSelect={handleSelectEvent} 
                                       onEdit={handleOpenForm} 
                                   />
                               ))}
                           </div>
                        )}
                    </div>
                </div>
            ) : (
                 <CalendarView 
                    events={events}
                    onSelectEvent={handleSelectEvent}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    onDateSelect={handleDateSelect}
                />
            )}


            <EventFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseForm}
                onSave={handleSaveAndCloseForm}
                eventToEdit={eventToEdit}
                members={members}
                groups={groups}
                initialDate={initialDateForForm}
            />

            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                members={members}
                onCancel={handleCancelEvent}
                onEdit={handleEditFromDetail}
                onDelete={handleDeleteFromDetail}
                currency={currentChurch.data.settings.currency || 'FCFA'}
            />
        </div>
    );
};

export default Events;
