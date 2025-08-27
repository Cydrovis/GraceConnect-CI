import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DUMMY_ACTIVITIES } from '../dummyData';
import { 
    UserPlusIcon, CalendarDaysIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon, ChartBarIcon, RocketLaunchIcon,
    ExclamationTriangleIcon, MegaphoneIcon, ChevronLeftIcon, ChevronRightIcon,
    FolderIcon, BanknotesIcon, PresentationChartBarIcon, BookOpenIcon, InformationCircleIcon, CheckCircleIcon,
    HeartIcon
} from './icons/HeroIcons';
import { hasPermission, SIDEBAR_ITEMS } from '../constants';
import DashboardHeader from './DashboardHeader';
import { useAuth, useChurch, useUI } from '../contexts';
import { NavItem } from '../types';

const findNavItemRecursive = (items: NavItem[], id: string): NavItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.subItems) {
            const found = findNavItemRecursive(item.subItems, id);
            if (found) return found;
        }
    }
    return null;
};

const ChartContainer: React.FC<{ title: string; children: React.ReactElement }> = ({ title, children }) => (
    <div className="bg-theme-card p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-theme-text-base mb-4">{title}</h3>
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

const WelcomeHeader: React.FC = () => {
    const { userForHeaderAndSidebar: user } = useAuth();
    const { currentChurch } = useChurch();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const nextEvent = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return currentChurch.data.events
            .filter(e => e.startDate === today && e.status === 'À venir')
            .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    }, [currentChurch.data.events]);

    const formattedDate = time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (!user) return null;

    return (
        <div className="bg-theme-card p-5 rounded-lg shadow-md flex flex-col gap-4 text-center md:flex-row md:text-left md:justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-theme-text-base">Bonjour, {user.name.split(' ')[0]} ! Que Dieu vous bénisse aujourd’hui 🙏</h2>
                <p className="text-theme-text-muted mt-1">{formattedDate} - {formattedTime}</p>
            </div>
            {nextEvent && (
                <div className="text-center md:text-right">
                    <p className="font-semibold text-theme-accent">Prochain événement :</p>
                    <p className="text-theme-text-muted">{nextEvent.name} à {nextEvent.startTime}</p>
                </div>
            )}
        </div>
    );
};

const QuickAction: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="bg-theme-card p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-2">{icon}</div>
        <span className="text-sm font-semibold text-theme-text-base">{label}</span>
    </button>
);

const MiniCalendar: React.FC = () => {
    const { currentChurch } = useChurch();
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const calendarDays = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        calendarDays.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const eventsByDate = useMemo(() => {
        const map = new Map<string, any[]>();
        currentChurch.data.events.forEach(event => {
            const dateKey = event.startDate;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)?.push(event);
        });
        return map;
    }, [currentChurch.data.events]);

    const changeMonth = (offset: number) => {
        setCurrentDate(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    };

    return (
        <div className="bg-theme-card p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full text-theme-text-base hover:bg-slate-100"><ChevronLeftIcon className="w-5 h-5"/></button>
                <h3 className="text-sm font-bold text-theme-text-base">{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full text-theme-text-base hover:bg-slate-100"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-theme-text-muted">
                {days.map(d => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                    const dateKey = d.toISOString().split('T')[0];
                    const hasEvent = eventsByDate.has(dateKey);
                    const isToday = new Date().toISOString().split('T')[0] === dateKey;
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();

                    return (
                        <div key={i} className={`h-8 w-8 relative flex items-center justify-center rounded-full ${isCurrentMonth ? 'text-theme-text-base' : 'text-theme-text-muted opacity-50'} ${isToday ? 'bg-theme-accent text-white' : ''}`}>
                            <span>{d.getDate()}</span>
                            {hasEvent && <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface DashboardProps {
  onNavClick: (item: NavItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavClick }) => {
    const { userForHeaderAndSidebar: user, currentUserActiveRoles: userRoles } = useAuth();
    const { currentChurch } = useChurch();
    const { openRegistrationForm } = useUI();

    const { members, memberCotisations, transactions, events, settings: churchSettings, announcements } = currentChurch.data;

    const notifications = useMemo(() => {
        const notifs: Array<{ id: string; text: string; type: 'warning' | 'info'; targetPageId: string; }> = [];
        const unassignedMembers = members.filter(m => !m.department || m.department === '').length;
        if (unassignedMembers > 0) {
            notifs.push({ id: 'unassigned-members', text: `${unassignedMembers} membre(s) sans affectation à un département.`, type: 'warning', targetPageId: 'members-list' });
        }
        const overduePledges = memberCotisations.filter(p => p.status === 'En retard').length;
        if (overduePledges > 0) {
            notifs.push({ id: 'overdue-pledges', text: `${overduePledges} cotisation(s) en retard.`, type: 'warning', targetPageId: 'cotisations' });
        }
        const today = new Date().toISOString().split('T')[0];
        const todaysEvents = events.filter(e => e.startDate === today && e.status === 'À venir');
        todaysEvents.forEach(event => {
            notifs.push({ id: `event-${event.id}`, text: `Aujourd'hui : ${event.name} à ${event.startTime}.`, type: 'info', targetPageId: 'events' });
        });
        return notifs;
    }, [members, memberCotisations, events]);
    
    const financialOverviewData = useMemo(() => {
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const dataByMonth: { [key: string]: { Dépenses: number, Dîmes: number, Offrandes: number } } = {};
        transactions.forEach(t => {
            const month = monthNames[new Date(t.date).getMonth()];
            if (!dataByMonth[month]) dataByMonth[month] = { Dépenses: 0, Dîmes: 0, Offrandes: 0 };
            if (t.type === 'expense') dataByMonth[month].Dépenses += t.amount;
            else if (t.category === 'Dîme') dataByMonth[month].Dîmes += t.amount;
            else if (t.category === 'Offrande') dataByMonth[month].Offrandes += t.amount;
        });
        return monthNames.slice(0, 6).map(month => ({ name: month, ... (dataByMonth[month] || { Dépenses: 0, Dîmes: 0, Offrandes: 0 }) }));
    }, [transactions]);
    
    const membersDistributionData = useMemo(() => {
        const women = members.filter(m => m.gender === 'Femme').length;
        const men = members.filter(m => m.gender === 'Homme').length;
        const children = members.reduce((acc, member) => acc + (member.children?.length || 0), 0);
        const data = [ { name: 'Enfants', value: children, fill: '#f59e0b' }, { name: 'Femmes', value: women, fill: '#10b981' }, { name: 'Hommes', value: men, fill: '#3b82f6' }];
        if (women === 0 && men === 0 && children === 0) return [{ name: 'Aucune donnée', value: 1, fill: '#e5e7eb' }];
        return data.filter(d => d.value > 0);
    }, [members]);

    const otherUsersActivity = useMemo(() => {
        return DUMMY_ACTIVITIES
            .filter(activity => activity.actor !== user?.name)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user?.name]);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, value, name }: any) => {
        if (name === 'Aucune donnée') return null;
        const radius = outerRadius * 1.1;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return <text x={x} y={y} fill="rgb(var(--color-text-base))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">{value}</text>;
    };

    if (!user) return null;

    const handleQuickNav = (pageId: string) => {
        const item = findNavItemRecursive(SIDEBAR_ITEMS, pageId);
        if (item) {
            onNavClick(item);
        }
    }

    return (
      <div className="space-y-6">
          <DashboardHeader userRole={user.primaryRole} churchSettings={churchSettings} />
          <WelcomeHeader />
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {hasPermission(userRoles, 'members-list') && <QuickAction label="Ajouter un membre" icon={<UserPlusIcon className="w-6 h-6"/>} onClick={openRegistrationForm} />}
              {hasPermission(userRoles, 'events') && <QuickAction label="Planifier un culte" icon={<CalendarDaysIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('events')} />}
              {hasPermission(userRoles, 'finances-overview') && <QuickAction label="Enregistrer Offrande" icon={<CurrencyDollarIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('finances-overview')} />}
              {hasPermission(userRoles, 'announcements') && <QuickAction label="Envoyer Annonce" icon={<ChatBubbleLeftRightIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('announcements')} />}
              {hasPermission(userRoles, 'reports') && <QuickAction label="Télécharger Rapport" icon={<ChartBarIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('reports')} />}
              {hasPermission(userRoles, 'projects') && <QuickAction label="Ajouter Projet" icon={<RocketLaunchIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('projects')} />}
              {hasPermission(userRoles, 'cotisations') && <QuickAction label="Gestion des Cotisations" icon={<BanknotesIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('cotisations')} />}
              {hasPermission(userRoles, 'cas-deces') && <QuickAction label="Cas de Décès" icon={<HeartIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('cas-deces')} />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                  <ChartContainer title="Aperçu Financier Mensuel">
                        <BarChart data={financialOverviewData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--color-border))"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="rgb(var(--color-text-muted))" />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="rgb(var(--color-text-muted))" />
                            <Tooltip wrapperClassName="!bg-theme-card !border-theme-border" contentStyle={{ backgroundColor: 'rgb(var(--color-card-bg))', border: '1px solid rgb(var(--color-border))' }}/>
                            <Legend wrapperStyle={{fontSize: "12px", color: "rgb(var(--color-text-base))"}}/>
                            <Bar dataKey="Dépenses" fill="#f59e0b" name="Dépenses" radius={[4, 4, 0, 0]} barSize={15} />
                            <Bar dataKey="Offrandes" fill="#10b981" name="Offrandes" radius={[4, 4, 0, 0]} barSize={15} />
                            <Bar dataKey="Dîmes" fill="#6366f1" name="Dîmes" radius={[4, 4, 0, 0]} barSize={15} />
                        </BarChart>
                  </ChartContainer>
                  <ChartContainer title="Répartition des Membres">
                      <PieChart>
                          <Pie data={membersDistributionData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius="80%" dataKey="value" />
                          <Legend iconType="circle" wrapperStyle={{color: "rgb(var(--color-text-base))"}}/>
                          <Tooltip wrapperClassName="!bg-theme-card !border-theme-border" contentStyle={{ backgroundColor: 'rgb(var(--color-card-bg))', border: '1px solid rgb(var(--color-border))' }}/>
                      </PieChart>
                  </ChartContainer>
              </div>

              <div className="space-y-6">
                    <MiniCalendar />
                    <div className="bg-theme-card p-4 rounded-lg shadow-md">
                        <h3 className="font-bold text-theme-text-base mb-3">Notifications importantes</h3>
                        <ul className="space-y-2">
                           {notifications.length > 0 ? (
                                notifications.map((notif) => {
                                    const styles = { warning: 'text-yellow-800 bg-yellow-50', info: 'text-blue-800 bg-blue-50' };
                                    const icon = { warning: <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />, info: <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" /> };
                                    return (
                                        <li key={notif.id}>
                                            <button onClick={() => handleQuickNav(notif.targetPageId)} className={`w-full flex items-start gap-2 text-sm p-2 rounded-md text-left transition-colors hover:bg-opacity-80 ${styles[notif.type]}`}>
                                                {icon[notif.type]}
                                                <span>{notif.text}</span>
                                            </button>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="flex items-start gap-2 text-sm text-green-800 bg-green-50 p-2 rounded-md">
                                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Rien à signaler. Tout est en ordre !</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-theme-card p-4 rounded-lg shadow-md">
                        <h3 className="font-bold text-theme-text-base mb-3">Journal d'activité des autres utilisateurs</h3>
                        <ul className="space-y-3">
                            {otherUsersActivity.length > 0 ? (
                                otherUsersActivity.slice(0, 5).map(activity => (
                                    <li key={activity.id} className="flex items-center gap-3 text-sm">
                                        <span className="bg-slate-100 p-2 rounded-full text-theme-text-muted flex-shrink-0">{activity.icon}</span>
                                        <div className="flex-grow">
                                            <p className="text-theme-text-muted" dangerouslySetInnerHTML={{ __html: activity.text }}></p>
                                            <p className="text-xs text-theme-text-muted mt-0.5">par <b>{activity.actor}</b></p>
                                        </div>
                                    </li>
                                ))
                            ) : ( <li className="text-center text-sm text-theme-text-muted py-4"> Aucune activité récente d'autres utilisateurs. </li> )}
                        </ul>
                         {otherUsersActivity.length > 5 && (
                            <button onClick={() => handleQuickNav('activity-log')} className="w-full text-center mt-4 px-4 py-2 text-sm font-semibold text-theme-accent hover:bg-blue-50 rounded-md transition-colors">
                                Voir tout le journal d'activité
                            </button>
                        )}
                    </div>
                  
                    <div className="bg-theme-card p-4 rounded-lg shadow-md">
                        <h3 className="font-bold text-theme-text-base mb-3 flex items-center gap-2"><MegaphoneIcon className="w-5 h-5"/>Annonces Internes</h3>
                        <div className="text-sm text-theme-text-muted space-y-3 max-h-60 overflow-y-auto pr-2">
                            {announcements && announcements.length > 0 ? (
                                announcements.map(announcement => (
                                    <div key={announcement.id} className="border-b border-theme-border pb-3 last:border-b-0">
                                        <p className="font-semibold text-theme-text-base">{announcement.title}</p>
                                        <p className="mt-1 whitespace-pre-wrap">{announcement.content}</p>
                                        <p className="text-xs text-theme-text-muted opacity-70 mt-2 text-right"> Publié le {new Date(announcement.createdAt).toLocaleDateString('fr-FR')} </p>
                                    </div>
                                ))
                            ) : ( <p>Aucune annonce pour le moment.</p> )}
                        </div>
                    </div>
              </div>
          </div>
          
           <div>
              <h3 className="text-xl font-bold text-theme-text-base mb-3">Accès Rapides aux Modules</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {hasPermission(userRoles, 'members-list') && <QuickAction label="Fiches des membres" icon={<FolderIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('members-list')} />}
                  {hasPermission(userRoles, 'finances-overview') && <QuickAction label="Comptabilité" icon={<BanknotesIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('finances-overview')} />}
                  {hasPermission(userRoles, 'projects') && <QuickAction label="Gestion des projets" icon={<RocketLaunchIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('projects')} />}
                  {hasPermission(userRoles, 'education') && <QuickAction label="Formations" icon={<BookOpenIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('education')} />}
                  {hasPermission(userRoles, 'reports') && <QuickAction label="Rapports mensuels" icon={<PresentationChartBarIcon className="w-6 h-6"/>} onClick={() => handleQuickNav('reports')} />}
              </div>
          </div>
      </div>
    );
};

export default Dashboard;