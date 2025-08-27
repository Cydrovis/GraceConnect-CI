import React, { useState, useEffect, useRef } from 'react';
import { MessageThread, AppUser, InternalMessage } from '../types';
import { PaperAirplaneIcon, UserGroupIcon, PencilSquareIcon } from './icons/HeroIcons';
import { useAuth, useChurch, useUI } from '../contexts';

const InternalMessaging: React.FC = () => {
    const { currentUser } = useAuth();
    const { currentChurch, handleSendMessage, handleMarkAsRead } = useChurch();
    const { setNewMessageModalOpen } = useUI();
    const { appUsers, messageThreads: threads } = currentChurch.data;

    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const findUser = (id: string) => appUsers.find(u => u.id === id);

    const userThreads = threads
        .filter(t => t.participantIds.includes(currentUser.id))
        .sort((a, b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime());

    const selectedThread = userThreads.find(t => t.id === selectedThreadId);

    useEffect(() => {
        if (selectedThreadId) handleMarkAsRead(selectedThreadId);
    }, [selectedThreadId, handleMarkAsRead]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedThread?.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedThreadId) {
            handleSendMessage(selectedThreadId, newMessage.trim());
            setNewMessage('');
        }
    };
    
    const isUnread = (thread: MessageThread) => {
        return thread.messages.some(m => !m.isRead && m.senderId !== currentUser.id);
    }

    const selectedThreadParticipants = selectedThread?.participantIds
        .filter(id => id !== currentUser.id)
        .map(id => findUser(id)?.name)
        .filter(Boolean)
        .join(', ');
    
    return (
        <div className="bg-theme-card rounded-lg shadow-md h-full flex flex-col max-h-[calc(100vh-10rem)]">
            <header className="p-4 border-b border-theme-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-theme-text-base">Messagerie Interne</h2>
                 <button onClick={() => setNewMessageModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-church-dark-blue rounded-lg hover:bg-blue-900 shadow">
                    <PencilSquareIcon className="w-4 h-4"/> Nouveau Message
                </button>
            </header>
            <div className="flex flex-grow overflow-hidden">
                <aside className="w-1/3 border-r border-theme-border flex flex-col">
                    <ul className="overflow-y-auto">
                        {userThreads.map(thread => {
                            const otherParticipants = thread.participantIds.filter(id => id !== currentUser.id).map(id => findUser(id)?.name).filter(Boolean);
                            const lastMessage = thread.messages[thread.messages.length - 1];
                            const threadIsUnread = isUnread(thread);
                            const participantName = otherParticipants.length > 0 ? otherParticipants.join(', ') : 'Moi uniquement';
                            
                            return (
                                <li key={thread.id}>
                                    <button onClick={() => setSelectedThreadId(thread.id)} className={`w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-l-4 ${selectedThreadId === thread.id ? 'border-theme-accent bg-slate-50 dark:bg-slate-700' : 'border-transparent'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className={`truncate text-theme-text-base ${threadIsUnread ? 'font-bold' : ''}`}>{participantName}</p>
                                            {threadIsUnread && <span className="w-2.5 h-2.5 bg-theme-accent rounded-full flex-shrink-0 ml-2"></span>}
                                        </div>
                                        <p className={`text-sm truncate mt-1 ${threadIsUnread ? 'text-theme-text-base font-semibold' : 'text-theme-text-muted'}`}>{lastMessage.text}</p>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </aside>
                <main className="w-2/3 flex flex-col">
                    {selectedThread ? (
                         <>
                            <div className="p-3 border-b border-theme-border bg-theme-table-header">
                                <h3 className="font-semibold text-theme-text-base">{selectedThreadParticipants}</h3>
                                <p className="text-sm text-theme-text-muted truncate">{selectedThread.subject}</p>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {selectedThread.messages.map(message => {
                                    const sender = findUser(message.senderId);
                                    const isCurrentUser = message.senderId === currentUser.id;
                                    return (
                                        <div key={message.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                                            {!isCurrentUser && <img src={sender?.photoUrl} alt={sender?.name} className="w-8 h-8 rounded-full" />}
                                            <div className={`max-w-md p-3 rounded-2xl ${isCurrentUser ? 'bg-church-teal text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-600 text-theme-text-base rounded-bl-none'}`}>
                                                <p className="text-sm">{message.text}</p>
                                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                            {isCurrentUser && <img src={sender?.photoUrl} alt={sender?.name} className="w-8 h-8 rounded-full" />}
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSend} className="p-4 border-t border-theme-border flex items-center gap-2 bg-theme-table-header">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-grow"
                                />
                                <button type="submit" className="bg-church-dark-blue text-white p-3 rounded-full hover:bg-blue-900 transition-colors shadow">
                                    <PaperAirplaneIcon className="w-5 h-5"/>
                                </button>
                            </form>
                         </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center text-theme-text-muted">
                           <UserGroupIcon className="w-16 h-16 text-slate-300 dark:text-slate-600"/>
                           <h3 className="mt-2 text-lg font-semibold">Sélectionnez une conversation</h3>
                           <p className="text-sm">Ou commencez une nouvelle conversation pour discuter avec le personnel.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default InternalMessaging;