import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MessageBubble } from '@/components/MessageBubble';
import { PressableScale } from '@/components/PressableScale';
import { SettingsRow } from '@/components/SettingsRow';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppTheme } from '@/theme';
import { wallpaperById, wallpapers } from '@/data/wallpapers';

export default function WallpaperScreen() {
  const { colors, scheme, typography } = useAppTheme();
  const { wallpaperId, wallpaperDimming, setWallpaper, toggle } = useSettingsStore();
  const selected = wallpaperById(wallpaperId);
  const previewColor = scheme === 'dark' ? selected.dark : selected.light;

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <SubScreenHeader title="Wallpaper" backLabel="Chats" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.previewOuter}>
          <View style={[styles.phoneFrame, { borderColor: colors.onSurface }]}>
            <View style={[styles.phonePreview, { backgroundColor: previewColor }]}>
              <MessageBubble
                message={{ id: 'p1', chatId: 'preview', senderId: 'them', text: 'Hey! Loving this wallpaper 👀', createdAt: Date.now(), status: 'read' }}
                isOutgoing={false}
                showTail
              />
              <MessageBubble
                message={{ id: 'p2', chatId: 'preview', senderId: 'me', text: 'Right? Looks so clean.', createdAt: Date.now(), status: 'read' }}
                isOutgoing
                showTail
              />
            </View>
          </View>
        </View>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          SOLID COLORS
        </Text>
        <View style={styles.swatchGrid}>
          {wallpapers.map((w) => {
            const color = scheme === 'dark' ? w.dark : w.light;
            const active = w.id === wallpaperId;
            return (
              <PressableScale key={w.id} onPress={() => setWallpaper(w.id)} style={styles.swatchWrap}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: color, borderColor: active ? colors.primary : 'transparent' },
                  ]}
                />
                <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>{w.label}</Text>
              </PressableScale>
            );
          })}
        </View>

        <View style={{ marginTop: 16 }}>
          <SettingsRow
            label="Wallpaper Dimming"
            subtitle="Reduce brightness of image wallpapers in dark mode"
            accessory={{ type: 'switch', value: wallpaperDimming, onValueChange: () => toggle('wallpaperDimming') }}
          />
        </View>

        <PressableScale
          style={styles.resetBtn}
          onPress={() =>
            Alert.alert('Reset Wallpaper', 'Reset to the default wallpaper for all chats?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: () => setWallpaper('default') },
            ])
          }
        >
          <Text style={[typography.body, { color: colors.error, fontWeight: '600' }]}>Reset Wallpaper</Text>
        </PressableScale>
        <Text style={[typography.caption, styles.disclaimer, { color: colors.onSurfaceVariant }]}>
          This resets the wallpaper for all chats to the default. Individual chat wallpapers set from a
          conversation will also be cleared.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  previewOuter: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  phoneFrame: {
    width: 160,
    height: 300,
    borderRadius: 28,
    borderWidth: 6,
    overflow: 'hidden',
  },
  phonePreview: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-end',
    gap: 6,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    letterSpacing: 0.4,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  swatchWrap: {
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  disclaimer: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
