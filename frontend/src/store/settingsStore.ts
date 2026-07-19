import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PrivacyAudience = 'Everyone' | 'My Contacts' | 'Nobody';

type BooleanSettingKey =
  | 'readReceipts'
  | 'saveToCameraRoll'
  | 'keepChatsArchived'
  | 'fingerprintLock'
  | 'useLessDataForCalls'
  | 'wallpaperDimming';

type AudienceSettingKey = 'lastSeenAudience' | 'profilePhotoAudience' | 'aboutAudience' | 'statusAudience';

type SettingsState = {
  readReceipts: boolean;
  saveToCameraRoll: boolean;
  keepChatsArchived: boolean;
  fingerprintLock: boolean;
  useLessDataForCalls: boolean;
  lastSeenAudience: PrivacyAudience;
  profilePhotoAudience: PrivacyAudience;
  aboutAudience: PrivacyAudience;
  statusAudience: PrivacyAudience;
  wallpaperId: string;
  wallpaperDimming: boolean;
  toggle: (key: BooleanSettingKey) => void;
  setAudience: (key: AudienceSettingKey, value: PrivacyAudience) => void;
  setWallpaper: (id: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readReceipts: true,
      saveToCameraRoll: true,
      keepChatsArchived: false,
      fingerprintLock: false,
      useLessDataForCalls: false,
      lastSeenAudience: 'Everyone',
      profilePhotoAudience: 'Everyone',
      aboutAudience: 'Everyone',
      statusAudience: 'My Contacts',
      wallpaperId: 'default',
      wallpaperDimming: false,
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Pick<SettingsState, BooleanSettingKey>),
      setAudience: (key, value) => set({ [key]: value } as Pick<SettingsState, AudienceSettingKey>),
      setWallpaper: (id) => set({ wallpaperId: id }),
    }),
    { name: 'slyderchat.settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
