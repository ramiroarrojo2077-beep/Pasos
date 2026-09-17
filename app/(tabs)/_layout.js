import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';

function TabIcon({ icon, color }) {
  return <Text style={[styles.icon, { color }]}>{icon}</Text>;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bgDeep,
          borderTopColor: colors.borderSoft,
          borderTopWidth: 2,
          height: 60 + bottom,
          paddingTop: 8,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <TabIcon icon="🗺️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="torneos"
        options={{
          title: 'Torneos',
          tabBarIcon: ({ color }) => <TabIcon icon="🏆" color={color} />,
        }}
      />
      <Tabs.Screen
        name="amigos"
        options={{
          title: 'Amigos',
          tabBarIcon: ({ color }) => <TabIcon icon="👥" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon icon="🙂" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 20 },
});
