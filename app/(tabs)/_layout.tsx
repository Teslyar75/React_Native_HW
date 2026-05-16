import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerStyle: { backgroundColor: "#f5f5f5" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Main Page",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => (
            <EvilIcons name="question" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "Lists",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="format-list-bulleted" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dimension"
        options={{
          title: "Dimensions",
          tabBarIcon: ({ color }) => (
            <Ionicons name="phone-portrait-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          href: null,
          title: "Список задач",
        }}
      />
      <Tabs.Screen
        name="image"
        options={{
          href: null,
          title: "Image",
        }}
      />
    </Tabs>
  );
}
