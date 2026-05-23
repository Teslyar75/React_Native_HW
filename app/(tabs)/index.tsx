import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [text, setText] = useState("");

  const pressButton = () => {
    Alert.alert("Thanks for Subscribe", "Waiting GooglePay services", [
      {
        text: "Ok",
        onPress: () => console.log("Ok Pressed"),
        style: "cancel",
      },
    ]);
  };

  const showToast = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Toast!", ToastAndroid.LONG);
    } else {
      Alert.alert("", "Toast!");
    }
  };

  return (
    <View style={styles.screenRoot}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <View style={styles.headerBlock}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome to our APP</Text>
            <Text style={styles.desc}>cool app</Text>
          </View>
          <TouchableOpacity onPress={pressButton} style={styles.button}>
            <Text style={styles.buttonText}>Subscribe $2.99/Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showToast}
            style={[styles.button, { backgroundColor: "#1b9c2c" }]}
          >
            <Text style={styles.buttonText}>Show Toast</Text>
          </TouchableOpacity>

          <Button title="Default button" color="#0f836a" onPress={pressButton} />

          <TouchableOpacity
            style={styles.tasksNavButton}
            onPress={() => router.push("/tasks")}
          >
            <Text style={styles.tasksNavButtonText}>Список задач</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.databaseNavButton}
            onPress={() => router.push("/database")}
          >
            <Text style={styles.tasksNavButtonText}>База данных</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restNavButton}
            onPress={() => router.push("/rest")}
          >
            <AntDesign name="api" size={22} color="#fff" />
            <Text style={styles.tasksNavButtonText}>REST API</Text>
          </TouchableOpacity>

          <View style={styles.switch}>
            <Text style={{ fontSize: 18 }}>Notifications</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#007aff" : "#f4f3f4"}
              onValueChange={() => setIsEnabled(!isEnabled)}
              value={isEnabled}
            />
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Type something"
              onChangeText={setText}
              value={text}
              placeholderTextColor="#999"
            />
            <Text style={{ color: "gray", fontSize: 18 }}>&gt; {text}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    flexGrow: 1,
  },
  headerBlock: { gap: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: "bold", fontFamily: "sans-serif" },
  desc: { fontSize: 16, color: "#666" },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  tasksNavButton: {
    backgroundColor: "#5856d6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  tasksNavButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  databaseNavButton: {
    backgroundColor: "#5856d6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  restNavButton: {
    backgroundColor: "#0f836a",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  switch: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    borderRadius: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});
