
import React from 'react';
import { DUMMY_ACTIVITIES } from '../dummyData';
import { ClipboardDocumentListIcon } from './icons/HeroIcons';

const ActivityLog: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardDocumentListIcon className="w-8 h-8 text-theme-text-muted" />
        <h2 className="text-2xl font-bold text-theme-text-base">Journal d'activité</h2>
      </div>

      <div className="bg-theme-card p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <ul className="divide-y divide-theme-border">
            {DUMMY_ACTIVITIES.map(activity => (
              <li key={activity.id} className="flex items-center gap-4 py-4">
                <span className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full text-theme-text-muted">
                  {activity.icon}
                </span>
                <div className="flex-grow">
                  <p className="text-sm text-theme-text-base" dangerouslySetInnerHTML={{ __html: activity.text }}></p>
                  <p className="text-xs text-theme-text-muted mt-1">
                    Par {activity.actor} - {new Date(activity.date).toLocaleString('fr-FR')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;