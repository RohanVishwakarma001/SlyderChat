import { Alert, ScrollView, View } from 'react-native';

import { ListSectionCard } from '@/components/ListSectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { useAppTheme } from '@/theme';

const notImplemented = (title: string) => () => Alert.alert(title, 'Not part of this prototype.');

export default function AccountSettingsScreen() {
  const { colors, badgeColors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <SubScreenHeader title="Account" backLabel="Settings" />
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
        <ListSectionCard>
          <SettingsRow icon="notifications" iconBackground={badgeColors.blue} label="Security Notifications" onPress={notImplemented('Security Notifications')} />
          <SettingsRow icon="key" iconBackground={badgeColors.purple} label="Passkeys" onPress={notImplemented('Passkeys')} />
          <SettingsRow icon="security" iconBackground={badgeColors.green} label="Two-step Verification" onPress={notImplemented('Two-step Verification')} />
          <SettingsRow icon="phone_iphone" iconBackground={badgeColors.blue} label="Change Number" onPress={notImplemented('Change Number')} />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow icon="description" iconBackground={badgeColors.blue} label="Request Account Info" onPress={notImplemented('Request Account Info')} />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            icon="delete_forever"
            iconBackground={colors.error}
            label="Delete Account"
            destructive
            onPress={() =>
              Alert.alert('Delete Account', 'This is a prototype — no account will actually be deleted.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' },
              ])
            }
          />
        </ListSectionCard>
      </ScrollView>
    </View>
  );
}
