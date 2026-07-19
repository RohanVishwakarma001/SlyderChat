import type { Contact } from './types';

// Demo/seed contacts used by the Calls, Updates, and Communities tabs, which have
// no backend equivalent in this build (see AGENTS spec — only auth/users/chat/media
// are backed by the API). Real registered users synced from the device address book
// are merged in on top of this list at runtime; see src/store/usersStore.ts.
export const contacts: Contact[] = [
  { id: 'aria', name: 'Aria', phone: '+1 415 555 0192', about: 'Living my best life ✨', online: true },
  { id: 'rahul', name: 'Rahul Sharma', phone: '+91 98765 43210', about: 'Busy building things.' },
  { id: 'mom', name: 'Mom ❤️', phone: '+91 98200 11223', about: 'Call me when free' },
  { id: 'karan', name: 'Karan', phone: '+91 90210 45678', about: 'Available' },
  { id: 'abhishek', name: 'Abhishek', phone: '+91 99887 66554', about: 'At the gym 🏋️' },
  { id: 'ishaan', name: 'Ishaan', phone: '+91 91234 56789', about: 'Sleeping' },
  { id: 'zoya', name: 'Zoya', phone: '+91 93456 78901', about: 'Working from home' },
  { id: 'rohan', name: 'Rohan', phone: '+91 97654 32109', about: 'Hey there! I am using SlyderChat.' },
  { id: 'priya', name: 'Priya', phone: '+91 90000 11122', about: 'Coffee first ☕️' },
  { id: 'arjun', name: 'Arjun', phone: '+91 96543 21098', about: 'Battery about to die' },
  { id: 'neha', name: 'Neha', phone: '+91 92345 67890', about: 'In a meeting' },
  { id: 'vikram', name: 'Vikram', phone: '+91 98123 45670', about: 'Available' },
  { id: 'sanya', name: 'Sanya', phone: '+91 90123 45678', about: 'Traveling ✈️' },
  { id: 'kabir', name: 'Kabir', phone: '+91 91111 22233', about: 'Chasing deadlines' },
  { id: 'ben', name: 'Ben', phone: '+1 628 555 0110', about: 'Design is my passion' },
  { id: 'chloe', name: 'Chloe', phone: '+44 7700 900123', about: 'Coding my way through the weekend ☕️' },
  { id: 'sneha', name: 'Sneha', phone: '+91 99001 12233', about: 'Available' },
  { id: 'dad', name: 'Dad', phone: '+91 98200 99887', about: 'At work' },
];
