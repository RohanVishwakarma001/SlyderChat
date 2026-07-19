import type { Community } from './types';
import { daysAgo, hoursAgo } from './time';

export const initialCommunities: Community[] = [
  {
    id: 'com-1',
    name: 'SlyderChat Neighbors',
    announcementPreview: 'Society meeting this Sunday at 5 PM in the clubhouse.',
    announcementAt: hoursAgo(5),
    totalGroups: 4,
    groups: [
      { id: 'com-1-g1', name: 'General Chat', preview: 'Does anyone have a spare parking spot?', updatedAt: hoursAgo(2) },
      { id: 'com-1-g2', name: 'Events', preview: 'Diwali potluck sign-up sheet is up!', updatedAt: hoursAgo(8) },
    ],
  },
  {
    id: 'com-2',
    name: 'College Alumni Network',
    announcementPreview: 'Annual meetup registrations are now open.',
    announcementAt: daysAgo(1),
    totalGroups: 6,
    groups: [
      { id: 'com-2-g1', name: 'Batch of 2020', preview: 'Reunion venue finalized', updatedAt: daysAgo(1) },
      { id: 'com-2-g2', name: 'Job Referrals', preview: 'Opening at a fintech startup, DM me', updatedAt: daysAgo(2) },
    ],
  },
];
