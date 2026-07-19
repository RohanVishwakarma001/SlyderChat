import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiClient, extractErrorMessage } from '@/api/client';
import { Avatar } from '@/components/Avatar';
import { ListSectionCard } from '@/components/ListSectionCard';
import { PressableScale } from '@/components/PressableScale';
import { SettingsRow } from '@/components/SettingsRow';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export default function ProfileEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { profile, updateProfile } = useAuthStore();
  const [name, setName] = useState(profile.name);
  const [about, setAbout] = useState(profile.about);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleDone = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || profile.name, about: about.trim() });
      router.back();
    } catch (e) {
      Alert.alert('Could not save profile', extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEditPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
      const { data } = await apiClient.post('/api/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await updateProfile({ avatarUrl: data.url });
    } catch (e) {
      Alert.alert('Upload failed', extractErrorMessage(e));
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant + '4d' }]}>
        <PressableScale haptic={false} onPress={() => router.back()}>
          <Text style={[typography.body, { color: colors.primary }]}>Cancel</Text>
        </PressableScale>
        <Text style={[typography.headline, { color: colors.onSurface }]}>Edit Profile</Text>
        <PressableScale haptic={false} onPress={handleDone} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[typography.headline, { color: colors.primary }]}>Done</Text>
          )}
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
        <View style={styles.avatarWrap}>
          <Avatar name={profile.name} uri={profile.avatarUri} size={160} />
          <PressableScale haptic={false} onPress={handleEditPhoto} disabled={uploadingAvatar}>
            {uploadingAvatar ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
            ) : (
              <Text style={[typography.body, { color: colors.primary, marginTop: 12 }]}>Edit</Text>
            )}
          </PressableScale>
        </View>

        <ListSectionCard>
          <View style={styles.nameRow}>
            <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[typography.body, { color: colors.onSurface, padding: 0 }]}
              maxLength={25}
              placeholder="Your name"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>
          <View style={styles.nameRow}>
            <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>About</Text>
            <TextInput
              value={about}
              onChangeText={setAbout}
              style={[typography.body, { color: colors.onSurface, padding: 0 }]}
              maxLength={139}
              placeholder="Your about"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow label="Phone Number" accessory={{ type: 'value', text: profile.phone || 'Not set' }} disabled />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            icon="delete_forever"
            iconBackground={colors.error}
            label="Delete Account"
            destructive
            onPress={() => Alert.alert('Delete Account', 'This is a prototype — no account will actually be deleted.')}
          />
        </ListSectionCard>

        <Text style={[typography.caption, styles.version, { color: colors.onSurfaceVariant }]}>SlyderChat v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  nameRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  version: {
    textAlign: 'center',
    marginTop: 16,
  },
});
