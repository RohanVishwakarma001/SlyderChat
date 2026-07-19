import type { CallLogEntry } from './types';
import { daysAgo, hoursAgo, minutesAgo } from './time';

export const initialCalls: CallLogEntry[] = [
  { id: 'call-1', contactId: 'aria', name: 'Aria', direction: 'outgoing', kind: 'video', createdAt: minutesAgo(40) },
  { id: 'call-2', contactId: 'rahul', name: 'Rahul Sharma', direction: 'missed', kind: 'audio', createdAt: hoursAgo(3) },
  { id: 'call-3', contactId: 'college-group', name: 'College Group 🎓', direction: 'incoming', kind: 'audio', createdAt: hoursAgo(6) },
  { id: 'call-4', contactId: 'mom', name: 'Mom ❤️', direction: 'outgoing', kind: 'audio', createdAt: daysAgo(1) },
  { id: 'call-5', contactId: 'karan', name: 'Karan', direction: 'missed', kind: 'video', createdAt: daysAgo(1) },
  { id: 'call-6', contactId: 'zoya', name: 'Zoya', direction: 'incoming', kind: 'audio', createdAt: daysAgo(2) },
  { id: 'call-7', contactId: 'vikram', name: 'Vikram', direction: 'outgoing', kind: 'audio', createdAt: daysAgo(3) },
  { id: 'call-8', contactId: 'project-team', name: 'Project Team', direction: 'incoming', kind: 'video', createdAt: daysAgo(4) },
];
