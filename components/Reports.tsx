


import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserGroupIcon, DocumentArrowDownIcon, CalendarDaysIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, GiftIcon } from './icons/HeroIcons';
import { Member, Group, Transaction, ChurchEvent, Project, CotisationCampaign, MemberCotisation, ChurchSettings, DeathCase } from '../types';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

interface ReportsProps {
    members: Member[];
    transactions: Transaction[];
    events: ChurchEvent[];
    projects: Project[];
    cotisationCampaigns: CotisationCampaign[];
    memberCotisations: MemberCotisation[];
    groups: Group[];
    churchSettings: ChurchSettings;
    deathCases: DeathCase[];
}

const ReportCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description: string }> = ({ title, value, icon, description }) => (
    <div className="bg-theme-card p-5 rounded-lg shadow-md flex items-start gap-4">
        <div className="bg-slate-100 p-3 rounded-full text-theme-accent">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-theme-text-muted">{title}</p>
            <p className="text-3xl font-bold text-theme-text-base">{value}</p>
            <p className="text-xs text-theme-text-muted mt-1">{description}</p>
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactElement }> = ({ title, children }) => (
    <div className="bg-theme-card p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-theme-text-base mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

interface ReportSection {
    title: string;
    head: RowInput[];
    body: RowInput[];
    foot?: RowInput[];
}

const Reports: React.FC<ReportsProps> = ({ members, transactions, events, projects, cotisationCampaigns, memberCotisations, groups, churchSettings, deathCases }) => {
    
    const currency = churchSettings.currency || 'FCFA';

    const handleGenerateFullReport = () => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 14;
        let y = margin;

        const addPageIfNeeded = (spaceNeeded: number) => {
            if (y + spaceNeeded > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        const addFooter = () => {
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Page ${i} sur ${pageCount}`, pageWidth - margin - 10, pageHeight - 10);
                doc.text(`Rapport généré par GraceConnect - ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 10);
            }
        };
        
        // --- Header ---
        addPageIfNeeded(30);
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("Rapport d'Activité Complet", margin, y);
        y += 8;
        doc.setFontSize(12);
        doc.text(`${churchSettings.name}`, margin, y);
        y += 12;

        // --- All Calculations ---
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;

        const eventsByStatus = events.reduce((acc, event) => {
            acc[event.status] = (acc[event.status] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        const eventSummaryText = `Total: ${events.length} événements (${Object.entries(eventsByStatus).map(([status, count]) => `${status}: ${count}`).join(', ')})`;

        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
        const totalRemainingProjects = totalBudget - totalSpent;

        const totalExpectedCotisations = memberCotisations.reduce((sum, mc) => sum + mc.expectedAmount, 0);
        const totalReceivedCotisations = memberCotisations.reduce((sum, mc) => sum + mc.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
        const totalRemainingCotisations = totalExpectedCotisations - totalReceivedCotisations;
        
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const salaryTransactions = transactions.filter(t => t.category === 'Salaire');
        const totalSalaries = salaryTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        const deathCaseCampaigns = cotisationCampaigns.filter(c => c.type === 'Cas de Décès');
        
        // --- Sections ---
        const sections: ReportSection[] = [
            {
                title: "Rapport Financier Global",
                head: [['Date', 'Description', 'Catégorie', 'Type', `Montant (${currency})`]],
                body: transactions.map(t => [
                    new Date(t.date).toLocaleDateString('fr-FR'),
                    t.description,
                    t.category,
                    t.type === 'income' ? 'Revenu' : 'Dépense',
                    (t.type === 'income' ? '+' : '-') + t.amount.toFixed(2)
                ]),
                foot: [
                    [{ content: 'Revenu Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalIncome.toFixed(2)} ${currency}`, styles: { halign: 'right' } }],
                    [{ content: 'Dépenses Totales:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalExpenses.toFixed(2)} ${currency}`, styles: { halign: 'right' } }],
                    [{ content: 'Solde:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${balance.toFixed(2)} ${currency}`, styles: { halign: 'right', fontStyle: 'bold' } }]
                ]
            },
            {
                title: "Rapport des Revenus",
                head: [['Date', 'Description', 'Catégorie', 'Membre', `Montant (${currency})`]],
                body: incomeTransactions.map(t => {
                    const member = t.memberId ? members.find(m => m.id === t.memberId) : null;
                    return [
                        new Date(t.date).toLocaleDateString('fr-FR'),
                        t.description,
                        t.category,
                        member ? `${member.firstName} ${member.lastName}` : 'Anonyme',
                        `+${t.amount.toFixed(2)}`
                    ];
                }),
                foot: [[{ content: `Total des revenus: ${totalIncome.toFixed(2)} ${currency}`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }]]
            },
            {
                title: "Rapport des Dépenses",
                head: [['Date', 'Description', 'Catégorie', `Montant (${currency})`]],
                body: expenseTransactions.map(t => [
                    new Date(t.date).toLocaleDateString('fr-FR'),
                    t.description,
                    t.category,
                    `-${t.amount.toFixed(2)}`
                ]),
                foot: [[{ content: `Total des dépenses: ${totalExpenses.toFixed(2)} ${currency}`, colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }]]
            },
            {
                title: "Rapport des Salaires",
                head: [['Date', 'Description', `Montant (${currency})`]],
                body: salaryTransactions.map(t => [
                    new Date(t.date).toLocaleDateString('fr-FR'),
                    t.description,
                    `-${t.amount.toFixed(2)}`
                ]),
                foot: [[{ content: `Total des salaires: ${totalSalaries.toFixed(2)} ${currency}`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }]]
            },
            {
                title: "Rapport des Événements",
                head: [['Nom', 'Type', 'Date', 'Lieu', 'Statut']],
                body: events.map(e => [e.name, e.type, new Date(e.startDate).toLocaleDateString('fr-FR'), e.location, e.status]),
                foot: [[{ content: eventSummaryText, colSpan: 5, styles: { halign: 'left', fontStyle: 'italic' } }]]
            },
            {
                title: "Rapport des Projets",
                head: [['Nom', 'Statut', `Budget (${currency})`, `Dépensé (${currency})`, 'Responsable']],
                body: projects.map(p => {
                    const leader = members.find(m => m.id === p.leaderId);
                    return [p.name, p.status, p.budget.toLocaleString('fr-FR'), p.spent.toLocaleString('fr-FR'), leader ? `${leader.firstName} ${leader.lastName}` : 'N/A'];
                }),
                foot: [
                     [{ content: 'Budget Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalBudget.toLocaleString('fr-FR')} ${currency}`, styles: { halign: 'right' } }],
                     [{ content: 'Dépensé Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalSpent.toLocaleString('fr-FR')} ${currency}`, styles: { halign: 'right' } }],
                     [{ content: 'Solde Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalRemainingProjects.toLocaleString('fr-FR')} ${currency}`, styles: { halign: 'right', fontStyle: 'bold' } }]
                ]
            },
            {
                title: "Rapport des Cotisations",
                head: [['Campagne', 'Membre', `Attendu (${currency})`, `Payé (${currency})`, 'Statut']],
                body: memberCotisations.map(mc => {
                    const campaign = cotisationCampaigns.find(c => c.id === mc.campaignId);
                    const member = members.find(m => m.id === mc.memberId);
                    const paid = mc.payments.reduce((sum, p) => sum + p.amount, 0);
                    return [
                        campaign ? campaign.name : 'N/A',
                        member ? `${member.firstName} ${member.lastName}` : 'N/A',
                        mc.expectedAmount.toLocaleString('fr-FR'),
                        paid.toLocaleString('fr-FR'),
                        mc.status
                    ];
                }),
                 foot: [
                    [{ content: 'Total Attendu:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalExpectedCotisations.toLocaleString('fr-FR')} ${currency}`, styles: { halign: 'right' } }],
                    [{ content: 'Total Reçu:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalReceivedCotisations.toLocaleString('fr-FR')} ${currency}`, styles: { halign: 'right' } }],
                    [{ content: 'Total Restant:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalRemainingCotisations.toLocaleString('fr-FR')} ${currency}`, styles: { halign: 'right', fontStyle: 'bold' } }]
                ]
            },
            {
                title: "Rapport des Cas de Décès",
                head: [['Défunt', 'Date Déclaration', 'Statut', 'Contact Famille']],
                body: deathCases.map(dc => {
                    const contact = members.find(m => m.id === dc.familyContactMemberId);
                    return [
                        dc.deceasedName,
                        new Date(dc.declarationDate).toLocaleDateString('fr-FR'),
                        dc.status,
                        contact ? `${contact.firstName} ${contact.lastName}` : 'N/A'
                    ]
                }),
                foot: [[{ content: `Total: ${deathCases.length} cas enregistrés`, colSpan: 4, styles: { fontStyle: 'italic' } }]]
            },
            ...(deathCaseCampaigns.length > 0 ? [{
                title: "Rapport des Cotisations pour Cas de Décès",
                head: [['Campagne', 'Défunt', `Attendu (${currency})`, `Reçu (${currency})`, 'Statut']],
                body: deathCaseCampaigns.map(campaign => {
                     const aCase = deathCases.find(dc => dc.id === campaign.deathCaseId);
                     const pledges = memberCotisations.filter(p => p.campaignId === campaign.id);
                     const expected = pledges.reduce((sum, p) => sum + p.expectedAmount, 0);
                     const received = pledges.reduce((sum, p) => sum + p.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0);
                     return [
                         campaign.name,
                         aCase ? aCase.deceasedName : 'N/A',
                         expected.toLocaleString('fr-FR'),
                         received.toLocaleString('fr-FR'),
                         campaign.endDate && new Date(campaign.endDate) < new Date() ? 'Terminée' : 'En cours'
                     ]
                })
            }] : [])
        ];

        sections.forEach(section => {
            addPageIfNeeded(25);
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(section.title, margin, y);
            
            autoTable(doc, {
                head: section.head,
                body: section.body,
                foot: section.foot,
                startY: y + 8,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59] }, // primary color
                footStyles: { fillColor: [241, 245, 249], textColor: 51 },
                didParseCell: (data) => {
                    if (data.column.index > 0 && (data.row.section === 'body' || data.row.section === 'foot')) {
                        const cellText = String(data.cell.raw);
                         if (cellText.includes(currency) || cellText.startsWith('+') || cellText.startsWith('-')) {
                           data.cell.styles.halign = 'right';
                        }
                    }
                },
            });
            y = (doc as any).lastAutoTable.finalY + 15;
        });

        addFooter();
        doc.save(`rapport_complet_graceconnect_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const membersByGroupData = useMemo(() =>
        groups.map(group => ({
            name: group.name,
            value: group.memberIds.length
        })), [groups]
    );

    const monthlyAttendanceData = useMemo(() => {
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const attendanceByMonth: { [key: string]: number } = {};
    
        const currentYear = new Date().getFullYear();
    
        events.forEach(event => {
            const eventDate = new Date(event.startDate);
            if (eventDate.getFullYear() === currentYear) {
                const monthName = monthNames[eventDate.getMonth()];
                if (!attendanceByMonth[monthName]) {
                    attendanceByMonth[monthName] = 0;
                }
                attendanceByMonth[monthName] += event.attendeeIds.length;
            }
        });
    
        const today = new Date();
        const currentMonthIndex = today.getMonth();
        
        // Create labels for the last 7 months
        const last7MonthsLabels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setMonth(today.getMonth() - (6 - i));
            return monthNames[d.getMonth()];
        });
        
        return last7MonthsLabels.map(month => ({
            month,
            Présence: attendanceByMonth[month] || 0
        }));
    }, [events]);

    const { totalIncome } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income };
    }, [transactions]);

    const churchGrowthData = useMemo(() => {
        const currentMembers = members.length;
        // Assuming start of year members is 0 when starting fresh, as requested by user.
        const startMembers = 0; 
    
        let value: string;
        let description: string;
    
        if (startMembers === 0) {
            if (currentMembers > 0) {
                value = `+${currentMembers}`;
                description = `${currentMembers} nouveau(x) membre(s) enregistré(s).`;
            } else {
                value = '0';
                description = 'Aucun membre pour le moment.';
            }
        } else {
            const growth = ((currentMembers - startMembers) / startMembers) * 100;
            value = `${growth.toFixed(1)}%`;
            description = `De ${startMembers} à ${currentMembers} membres cette année.`;
        }
        
        return {
            value,
            description
        }
    }, [members]);

    const donationStatsData = useMemo(() => {
        const donationCategories = ['Dîme', 'Offrande', 'Don spécial', 'Contribution projet'];
        const stats = transactions
            .filter(t => t.type === 'income' && donationCategories.includes(t.category))
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = 0;
                }
                acc[t.category] += t.amount;
                return acc;
            }, {} as { [key: string]: number });
        
        return Object.entries(stats).map(([name, value]) => ({ name, Montant: value }));
    }, [transactions]);
    
    const PIE_COLORS = ['#1e293b', '#4f46e5', '#3b82f6', '#22c55e', '#94a3b8'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-text-base">Statistiques & Rapports</h2>
                    <p className="mt-1 text-theme-text-muted">Vue d'ensemble de la santé et de la croissance de l'église.</p>
                </div>
                <button onClick={handleGenerateFullReport} className="bg-church-dark-blue text-white px-4 py-2 rounded-md shadow hover:bg-blue-900 transition-colors flex items-center w-full md:w-auto justify-center">
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Télécharger le rapport complet
                </button>
            </div>
            
            {/* --- Summary Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard
                    title="Revenu Total (YTD)"
                    value={`${totalIncome.toLocaleString('fr-FR')} ${currency}`}
                    icon={<CurrencyDollarIcon className="w-7 h-7" />}
                    description="Total des entrées financières cette année."
                />
                 <ReportCard
                    title="Taux de Croissance"
                    value={churchGrowthData.value}
                    icon={<ArrowTrendingUpIcon className="w-7 h-7" />}
                    description={churchGrowthData.description}
                />
                 <ReportCard
                    title="Total des dons"
                    value={`${donationStatsData.reduce((acc, item) => acc + item.Montant, 0).toLocaleString('fr-FR')} ${currency}`}
                    icon={<GiftIcon className="w-7 h-7" />}
                    description="Dîmes, offrandes et dons spéciaux cumulés."
                />
            </div>

            {/* --- Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <ChartContainer title="Présences mensuelles aux cultes">
                        <LineChart data={monthlyAttendanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))"/>
                            <XAxis dataKey="month" stroke="rgb(var(--color-text-muted))" />
                            <YAxis stroke="rgb(var(--color-text-muted))" />
                            <Tooltip wrapperClassName="!bg-theme-card !border-theme-border" contentStyle={{ backgroundColor: 'rgb(var(--color-card-bg))', border: '1px solid rgb(var(--color-border))' }}/>
                            <Legend wrapperStyle={{color: "rgb(var(--color-text-base))"}}/>
                            <Line type="monotone" dataKey="Présence" stroke="rgb(var(--color-primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ChartContainer>
                </div>
                <div className="lg:col-span-2">
                    <ChartContainer title="Membres par département">
                         <PieChart>
                            <Pie
                                data={membersByGroupData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="80%"
                                fill="#8884d8"
                            >
                                {membersByGroupData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip wrapperClassName="!bg-theme-card !border-theme-border" contentStyle={{ backgroundColor: 'rgb(var(--color-card-bg))', border: '1px solid rgb(var(--color-border))' }}/>
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{color: "rgb(var(--color-text-base))"}}/>
                        </PieChart>
                    </ChartContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ChartContainer title="Statistiques sur les dons (par catégorie)">
                    <BarChart data={donationStatsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))"/>
                         <XAxis dataKey="name" stroke="rgb(var(--color-text-muted))" />
                         <YAxis stroke="rgb(var(--color-text-muted))" />
                         <Tooltip wrapperClassName="!bg-theme-card !border-theme-border" contentStyle={{ backgroundColor: 'rgb(var(--color-card-bg))', border: '1px solid rgb(var(--color-border))' }}/>
                         <Legend wrapperStyle={{color: "rgb(var(--color-text-base))"}}/>
                         <Bar dataKey="Montant" fill="rgb(var(--color-primary-light))" />
                    </BarChart>
                </ChartContainer>
            </div>

            <div className="bg-theme-card p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-theme-text-base mb-4">Rapport financier détaillé</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-theme-table-header">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-theme-text-base">Catégorie</th>
                                <th className="px-4 py-2 text-right font-semibold text-theme-text-base">Revenus</th>
                                <th className="px-4 py-2 text-right font-semibold text-theme-text-base">Dépenses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            {['Dîme', 'Offrande', 'Don spécial', 'Contribution projet', 'Facture', 'Salaire', 'Construction', 'Autre dépense', 'Autre revenu'].map(category => {
                                const income = transactions.filter(t => t.type === 'income' && t.category === category).reduce((sum, t) => sum + t.amount, 0);
                                const expense = transactions.filter(t => t.type === 'expense' && t.category === category).reduce((sum, t) => sum + t.amount, 0);
                                if (income === 0 && expense === 0) return null;
                                return (
                                <tr key={category}>
                                    <td className="px-4 py-2 font-medium text-theme-text-base">{category}</td>
                                    <td className="px-4 py-2 text-right text-green-600">{income > 0 ? `${income.toLocaleString('fr-FR')} ${currency}`: '-'}</td>
                                    <td className="px-4 py-2 text-right text-red-600">{expense > 0 ? `${expense.toLocaleString('fr-FR')} ${currency}`: '-'}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-theme-table-header font-bold text-theme-text-base">
                            <tr>
                                <td className="px-4 py-2 text-left">Total</td>
                                <td className="px-4 py-2 text-right text-green-700">{transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString('fr-FR')} {currency}</td>
                                <td className="px-4 py-2 text-right text-red-700">{transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString('fr-FR')} {currency}</td>
                            </tr>
                             <tr>
                                <td className="px-4 py-2 text-left">Solde</td>
                                <td colSpan={2} className="px-4 py-2 text-right text-blue-800">{(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('fr-FR')} {currency}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Reports;