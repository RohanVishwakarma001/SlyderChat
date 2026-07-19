import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { ListSectionCard } from '@/components/ListSectionCard';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingsRow } from '@/components/SettingsRow';
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, badgeColors, radii } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <ScreenHeader
        title="Settings"
        scrollY={scrollY}
        leading={
          <PressableScale haptic={false}>
            <Text style={[typography.body, { color: colors.primary }]}>Edit</Text>
          </PressableScale>
        }
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 40 }}
      >
        <Text style={[typography.largeTitle, { color: colors.onSurface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }]}>
          Settings
        </Text>

        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <PressableScale
            onPress={() => router.push('/settings/profile-edit')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: 12,
            }}
          >
            <Avatar name={profile.name} uri={profile.avatarUri} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.headline, { color: colors.onSurface }]}>{profile.name}</Text>
              <Text style={[typography.subheadline, { color: colors.outline }]} numberOfLines={1}>
                {profile.about}
              </Text>
            </View>
            <View style={{ backgroundColor: colors.surfaceContainerLow, padding: 8, borderRadius: 999 }}>
              <Icon name="qr_code_2" size={22} color={colors.primary} />
            </View>
          </PressableScale>
        </View>

        <ListSectionCard>
          <SettingsRow
            icon="star"
            iconBackground={badgeColors.yellow}
            label="Starred Messages"
            onPress={() => router.push('/settings/starred-messages')}
          />
          <SettingsRow
            icon="laptop_mac"
            iconBackground={badgeColors.blue}
            label="Linked Devices"
            onPress={() => router.push('/settings/linked-devices')}
          />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow icon="key" iconBackground={badgeColors.blue} label="Account" onPress={() => router.push('/settings/account')} />
          <SettingsRow icon="lock" iconBackground={badgeColors.green} label="Privacy" onPress={() => router.push('/settings/privacy')} />
          <SettingsRow icon="chat" iconBackground={colors.primary} label="Chats" onPress={() => router.push('/settings/chats')} />
          <SettingsRow
            icon="notifications"
            iconBackground={badgeColors.red}
            label="Notifications"
            onPress={() => Alert.alert('Notifications', 'Not part of this prototype.')}
          />
          <SettingsRow icon="data_usage" iconBackground={badgeColors.green} label="Storage and Data" onPress={() => router.push('/settings/storage')} />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow icon="help" iconBackground={badgeColors.blue} label="Help" onPress={() => Alert.alert('Help', 'Not part of this prototype.')} />
          <SettingsRow
            icon="favorite"
            iconBackground={badgeColors.pink}
            label="Tell a Friend"
            onPress={() => Alert.alert('Tell a Friend', 'Sharing is not part of this prototype.')}
          />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            icon="logout"
            iconBackground={colors.error}
            label="Log Out"
            destructive
            accessory={{ type: 'none' }}
            onPress={() =>
              Alert.alert('Log Out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: () => {
                    signOut();
                    router.replace('/phone-input');
                  },
                },
              ])
            }
          />
        </ListSectionCard>

        <View style={{ alignItems: 'center', gap: 4, paddingVertical: 24 }}>
          <Text style={[typography.caption, { color: colors.outline, textTransform: 'uppercase', letterSpacing: 1 }]}>from</Text>
          <Text style={[typography.headline, { color: colors.onSurface, fontWeight: '800' }]}>SlyderChat</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
