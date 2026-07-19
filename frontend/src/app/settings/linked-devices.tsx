import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ListSectionCard } from '@/components/ListSectionCard';
import { PressableScale } from '@/components/PressableScale';
import { SettingsRow } from '@/components/SettingsRow';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { useAppTheme } from '@/theme';

const devices = [
  { id: 'd1', name: 'MacBook Pro', meta: 'SlyderChat Desktop · Active now' },
  { id: 'd2', name: 'Chrome on Windows', meta: 'SlyderChat Web · Active 2 hours ago' },
];

export default function LinkedDevicesScreen() {
  const { colors, typography, radii } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <SubScreenHeader title="Linked Devices" backLabel="Settings" />
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
        <View style={styles.hero}>
          <View style={[styles.illustration, { backgroundColor: colors.primaryContainer + '26' }]}>
            <Icon name="laptop_mac" size={54} color={colors.primary} />
            <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.grouped }]}>
              <Icon name="add" size={14} color={colors.onPrimary} />
            </View>
          </View>
          <Text style={[typography.subheadline, { color: colors.onSurfaceVariant, textAlign: 'center', maxWidth: 300 }]}>
            Use SlyderChat on up to four linked devices and one phone at the same time.
          </Text>
          <PressableScale
            style={[styles.cta, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}
            onPress={() => Alert.alert('Link a Device', 'QR scanning is not part of this prototype.')}
          >
            <Text style={[typography.headline, { color: colors.onPrimaryContainer }]}>Link a Device</Text>
          </PressableScale>
        </View>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          DEVICE STATUS
        </Text>
        <ListSectionCard>
          {devices.map((device) => (
            <SettingsRow
              key={device.id}
              icon="laptop_mac"
              iconBackground={colors.secondary}
              label={device.name}
              subtitle={device.meta}
              onPress={() => Alert.alert(device.name, 'Manage this device is not part of this prototype.')}
            />
          ))}
        </ListSectionCard>

        <View style={styles.footer}>
          <Icon name="lock" size={16} color={colors.onSurfaceVariant} />
          <Text style={[typography.caption, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            Your personal messages are end-to-end encrypted between this phone and your linked devices.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    width: '100%',
    maxWidth: 280,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    letterSpacing: 0.4,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 40,
    paddingTop: 24,
  },
});
