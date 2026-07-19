import type { Channel, StatusUpdate } from './types';
import { hoursAgo, minutesAgo } from './time';

export const initialStatuses: StatusUpdate[] = [
  { id: 'st-1', contactId: 'rahul', name: 'Rahul Sharma', seen: false, createdAt: minutesAgo(20) },
  { id: 'st-2', contactId: 'zoya', name: 'Zoya', seen: false, createdAt: minutesAgo(45) },
  { id: 'st-3', contactId: 'karan', name: 'Karan', seen: false, createdAt: hoursAgo(2) },
  { id: 'st-4', contactId: 'priya', name: 'Priya', seen: true, createdAt: hoursAgo(5) },
  { id: 'st-5', contactId: 'vikram', name: 'Vikram', seen: true, createdAt: hoursAgo(10) },
  { id: 'st-6', contactId: 'sanya', name: 'Sanya', seen: true, createdAt: hoursAgo(18) },
];

export const initialChannels: Channel[] = [
  { id: 'ch-1', name: 'SlyderChat Tips', preview: 'New keyboard shortcuts just dropped 🎹', updatedAt: hoursAgo(3) },
  { id: 'ch-2', name: 'Cricket Updates', preview: 'India wins by 6 wickets! 🏏', updatedAt: hoursAgo(7) },
  { id: 'ch-3', name: 'Tech Daily', preview: 'The new SDK release is here', updatedAt: hoursAgo(14) },
];
