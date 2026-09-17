import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PixelIcon from '../../src/components/PixelIcon';
import { colors, type } from '../../src/theme';

function TabButton({ icon, color, focused }) {
  return (
    <View style={styles.tabItem}>
      <PixelIcon name={icon} size={22} color={color} />
      <View
        style={[
          styles.tick,
          { backgroundColor: focused ? colors.lime : 'transparent' },
        ]}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgDeep,
          borderTopColor: colors.border,
          borderTopWidth: 3,
          height: 66 + bottom,
          paddingTop: 10,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: {
          fontFamily: type.title.fontFamily,
          fontSize: 7,
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'INICIO',
          tabBarIcon: ({ color, focused }) => <TabButton icon="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'MAPA',
          tabBarIcon: ({ color, focused }) => <TabButton icon="map" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="torneos"
        options={{
          title: 'TORNEOS',
          tabBarIcon: ({ color, focused }) => <TabButton icon="trophy" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="amigos"
        options={{
          title: 'AMIGOS',
          tabBarIcon: ({ color, focused }) => <TabButton icon="users" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color, focused }) => <TabButton icon="person" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', gap: 4 },
  tick: { width: 16, height: 3 },
});
