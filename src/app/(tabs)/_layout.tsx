import { Tabs } from 'expo-router/tabs';
import { TabBar } from '../../components/TabBar';
import { color } from '../../theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.paper }, animation: 'shift' }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="friends" />
    </Tabs>
  );
}
