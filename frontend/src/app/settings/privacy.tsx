import { Alert, ScrollView, View, type AlertButton } from 'react-native';

import { ListSectionCard } from '@/components/ListSectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { useSettingsStore, type PrivacyAudience } from '@/store/settingsStore';
import { useAppTheme } from '@/theme';

const AUDIENCES: PrivacyAudience[] = ['Everyone', 'My Contacts', 'Nobody'];

export default function PrivacySettingsScreen() {
  const { colors, badgeColors } = useAppTheme();
  const settings = useSettingsStore();

  const pickAudience = (key: Parameters<typeof settings.setAudience>[0], title: string) => {
    const buttons: AlertButton[] = AUDIENCES.map((audience) => ({
      text: audience,
      onPress: () => settings.setAudience(key, audience),
    }));
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(title, undefined, buttons);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <SubScreenHeader title="Privacy" backLabel="Settings" />
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
        <ListSectionCard>
          <SettingsRow
            label="Last Seen & Online"
            accessory={{ type: 'value', text: settings.lastSeenAudience }}
            onPress={() => pickAudience('lastSeenAudience', 'Last Seen & Online')}
          />
          <SettingsRow
            label="Profile Photo"
            accessory={{ type: 'value', text: settings.profilePhotoAudience }}
            onPress={() => pickAudience('profilePhotoAudience', 'Profile Photo')}
          />
          <SettingsRow
            label="About"
            accessory={{ type: 'value', text: settings.aboutAudience }}
            onPress={() => pickAudience('aboutAudience', 'About')}
          />
          <SettingsRow label="Groups" accessory={{ type: 'value', text: 'Everyone' }} onPress={() => pickAudience('lastSeenAudience', 'Groups')} />
          <SettingsRow
            label="Status"
            accessory={{ type: 'value', text: settings.statusAudience }}
            onPress={() => pickAudience('statusAudience', 'Status')}
          />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            label="Read Receipts"
            accessory={{ type: 'switch', value: settings.readReceipts, onValueChange: () => settings.toggle('readReceipts') }}
          />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow label="Default Message Timer" accessory={{ type: 'value', text: 'Off' }} onPress={() => pickAudience('statusAudience', 'Default Message Timer')} />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow icon="block" iconBackground={colors.error} label="Blocked" accessory={{ type: 'value', text: '0' }} />
          <SettingsRow
            label="Fingerprint Lock"
            accessory={{ type: 'switch', value: settings.fingerprintLock, onValueChange: () => settings.toggle('fingerprintLock') }}
          />
        </ListSectionCard>
      </ScrollView>
    </View>
  );
}
