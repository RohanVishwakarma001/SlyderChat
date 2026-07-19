import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Badge, Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

import { selectVisibleChats, useChatsStore } from '@/store/chatsStore';
import { useAppTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const chats = useChatsStore((s) => s.chats);
  const unreadTotal = selectVisibleChats(chats).reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <NativeTabs
      tintColor={colors.primary}
      backgroundColor={colors.surface}
      labelStyle={{ color: colors.onSurfaceVariant }}
    >
      <NativeTabs.Trigger name="updates">
        <Label>Updates</Label>
        <Icon
          sf={{ default: 'bell.circle', selected: 'bell.circle.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="circle-notifications" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calls">
        <Label>Calls</Label>
        <Icon
          sf={{ default: 'phone', selected: 'phone.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="call" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="communities">
        <Label>Communities</Label>
        <Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="groups" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chats">
        <Label>Chats</Label>
        <Icon
          sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="chat" />}
        />
        {unreadTotal > 0 && <Badge>{String(unreadTotal)}</Badge>}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="settings" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
