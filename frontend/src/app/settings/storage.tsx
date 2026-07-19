import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ListSectionCard } from '@/components/ListSectionCard';
import { PressableScale } from '@/components/PressableScale';
import { SettingsRow } from '@/components/SettingsRow';
import { StorageBar } from '@/components/StorageBar';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppTheme } from '@/theme';

const notImplemented = (title: string) => () => Alert.alert(title, 'Not part of this prototype.');

export default function StorageSettingsScreen() {
  const { colors, typography, badgeColors, radii } = useAppTheme();
  const { useLessDataForCalls, toggle } = useSettingsStore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <SubScreenHeader title="Storage and Data" backLabel="Settings" />
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
        <ListSectionCard>
          <View style={styles.networkRow}>
            <View style={styles.networkStat}>
              <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>SENT</Text>
              <Text style={[typography.headline, { color: colors.onSurface }]}>1.2 GB</Text>
            </View>
            <View style={styles.networkStat}>
              <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>RECEIVED</Text>
              <Text style={[typography.headline, { color: colors.onSurface }]}>4.6 GB</Text>
            </View>
          </View>
        </ListSectionCard>

        <ListSectionCard>
          <PressableScale
            haptic={false}
            style={{ paddingHorizontal: 12, paddingVertical: 12, gap: 10 }}
            onPress={notImplemented('Manage Storage')}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[typography.body, { color: colors.onSurface }]}>Manage Storage</Text>
              <Icon name="chevron_right" size={18} color={colors.outline} />
            </View>
            <StorageBar
              segments={[
                { color: colors.primary, ratio: 0.62 },
                { color: colors.tertiary, ratio: 0.24 },
                { color: colors.surfaceContainerHighest, ratio: 0.14 },
              ]}
            />
            <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>2.8 GB used of 4.5 GB</Text>
          </PressableScale>
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            label="Use Less Data for Calls"
            accessory={{ type: 'switch', value: useLessDataForCalls, onValueChange: () => toggle('useLessDataForCalls') }}
          />
        </ListSectionCard>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          MEDIA AUTO-DOWNLOAD
        </Text>
        <ListSectionCard>
          <SettingsRow icon="image" iconBackground={badgeColors.blue} label="Photos" accessory={{ type: 'value', text: 'Wi-Fi & Cellular' }} onPress={notImplemented('Photos')} />
          <SettingsRow icon="mic" iconBackground={badgeColors.green} label="Audio" accessory={{ type: 'value', text: 'Wi-Fi' }} onPress={notImplemented('Audio')} />
          <SettingsRow icon="videocam" iconBackground={badgeColors.red} label="Video" accessory={{ type: 'value', text: 'Wi-Fi' }} onPress={notImplemented('Video')} />
          <SettingsRow icon="description" iconBackground={colors.onSurfaceVariant} label="Documents" accessory={{ type: 'value', text: 'Never' }} onPress={notImplemented('Documents')} />
        </ListSectionCard>
        <PressableScale style={styles.resetBtn} onPress={notImplemented('Reset Auto-Download Settings')}>
          <Text style={[typography.body, { color: colors.error, fontWeight: '600' }]}>Reset Auto-Download Settings</Text>
        </PressableScale>

        <ListSectionCard>
          <SettingsRow label="Media Upload Quality" accessory={{ type: 'value', text: 'Auto' }} onPress={notImplemented('Media Upload Quality')} />
          <SettingsRow label="Proxy" accessory={{ type: 'value', text: 'Off' }} onPress={notImplemented('Proxy')} />
        </ListSectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  networkRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  networkStat: {
    flex: 1,
    gap: 4,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    letterSpacing: 0.4,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: -8,
    marginBottom: 12,
  },
});
