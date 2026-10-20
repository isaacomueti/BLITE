import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { ColorValue } from 'react-native';

import { Icon, IconName } from '@/components/ui';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

const icon = (name: IconName, active: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon name={focused ? active : name} color={color as string} size={24} />;
  };

export default function TabsLayout() {
  const { orders, user, welcomed } = useStore();
  // Orders still to be paid, cooked or delivered.
  const live = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  // First launch: show the welcome screen (sign in, create an account or browse as a guest).
  if (!welcomed && !user) return <Redirect href="/welcome" />;
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
