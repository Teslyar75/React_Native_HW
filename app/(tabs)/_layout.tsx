import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Ionicons } from "@expo/vector-icons";
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
        name="tasks"
        options={{
          href: null,
          title: "Список задач",
        }}
      />
    </Tabs>
  );
}
