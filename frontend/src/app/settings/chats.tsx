import { useRouter } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';

import { ListSectionCard } from '@/components/ListSectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppTheme } from '@/theme';

const notImplemented = (title: string) => () => Alert.alert(title, 'Not part of this prototype.');

export default function ChatsSettingsScreen() {
  const router = useRouter();
  const { colors, badgeColors } = useAppTheme();
  const settings = useSettingsStore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <SubScreenHeader title="Chats" backLabel="Settings" />
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
        <ListSectionCard>
          <SettingsRow icon="wallpaper" iconBackground={badgeColors.purple} label="Wallpaper" onPress={() => router.push('/settings/wallpaper')} />
          <SettingsRow icon="save" iconBackground={badgeColors.green} label="Chat Backup" onPress={notImplemented('Chat Backup')} />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            label="Save to Camera Roll"
            accessory={{ type: 'switch', value: settings.saveToCameraRoll, onValueChange: () => settings.toggle('saveToCameraRoll') }}
          />
          <SettingsRow
            label="Keep Chats Archived"
            accessory={{ type: 'switch', value: settings.keepChatsArchived, onValueChange: () => settings.toggle('keepChatsArchived') }}
          />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow icon="phone_iphone" iconBackground={badgeColors.green} label="Move to Android" onPress={notImplemented('Move to Android')} />
          <SettingsRow icon="desktop_windows" iconBackground={colors.onSurfaceVariant} label="Transfer to iPhone" onPress={notImplemented('Transfer to iPhone')} />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow label="Export Chats" onPress={notImplemented('Export Chats')} accessory={{ type: 'none' }} />
          <SettingsRow label="Archive All Chats" onPress={notImplemented('Archive All Chats')} accessory={{ type: 'none' }} />
          <SettingsRow label="Clear All Chats" onPress={notImplemented('Clear All Chats')} accessory={{ type: 'none' }} />
          <SettingsRow label="Delete All Chats" destructive onPress={notImplemented('Delete All Chats')} accessory={{ type: 'none' }} />
        </ListSectionCard>
      </ScrollView>
    </View>
  );
}
