import { Tabs } from 'expo-router/js-tabs';
import { ColorValue } from 'react-native';

import { Icon, IconName } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import { C, F } from '@/lib/theme';

const icon = (name: IconName, active: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon name={focused ? active : name} color={color as string} size={24} />;
  };

export default function TabsLayout() {
  const { orders } = useStore();
  const now = useNow();
  const live = orders.filter((o) => now - new Date(o.placedAt).getTime() < 3 * 3600e3).length;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.red,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontFamily: F.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.border },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: icon('search-outline', 'search') }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: icon('receipt-outline', 'receipt'), tabBarBadge: live || undefined, tabBarBadgeStyle: { backgroundColor: C.red, fontFamily: F.bold, fontSize: 10 } }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
