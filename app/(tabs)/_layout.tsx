import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
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
            <SimpleLineIcons name="screen-smartphone" size={24} color={color} />
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
        name="contacts"
        options={{
          href: null,
          title: "Контакти",
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
        name="database"
        options={{
          href: null,
          title: "База данных",
        }}
      />
      <Tabs.Screen
        name="rest"
        options={{
          href: null,
          title: "REST API",
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
