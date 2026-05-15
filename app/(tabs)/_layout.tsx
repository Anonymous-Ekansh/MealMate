/**
 * MealMate - Tabs Layout
 * Bottom tab navigation for the main app.
 */

import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { AppIcon } from "../../components/AppIcon";

export default function TabsLayout() {
  const unreadCount = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.saffron,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AppIcon name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <AppIcon name="restaurant-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => (
            <AppIcon name="people-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AppIcon name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => (
            <AppIcon name="notifications-outline" size={24} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.saffron },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.borderLight,
    borderTopWidth: 1,
    height: 88,
    paddingBottom: 28,
    paddingTop: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
