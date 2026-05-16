import * as Contacts from "expo-contacts";
import { type Href, useRouter } from "expo-router";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const CARDS = ["A", "B", "C", "D"];

const DimensionTab = () => {
  const router = useRouter();
  const dimension = useWindowDimensions();
  const isWide = dimension.width > 500;

  const getContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });
      if (data.length > 0) {
        Alert.alert(
          "First contact",
          `Name: ${data[0].name}\nPhone numbers: ${
            data[0].phoneNumbers?.[0]?.number ?? "No-set"
          }`,
        );
      }
    }
  };

  const showPushNotify = async () => {
    if (Platform.OS !== "android") return;

    try {
      const Notifications = await import("expo-notifications");

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        ToastAndroid.show(
          "Go to settings and allow notifiacation permission",
          ToastAndroid.LONG,
        );
        return;
      }

      await Notifications.setNotificationChannelAsync("default", {
        name: "Main Channel",
        importance: Notifications.AndroidImportance.MAX,
        lightColor: "#3f9dd8ff",
        description: "Notify push",
      });

      await Notifications.scheduleNotificationAsync({
        content: { title: "Hello", body: "World" },
        trigger: null,
      });
    } catch {
      ToastAndroid.show("Hello: World", ToastAndroid.LONG);
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
    >
      <TouchableOpacity style={styles.button} onPress={showPushNotify}>
        <Text style={styles.buttonText}>Notify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.getContactButton]}
        onPress={getContact}
      >
        <Text style={styles.buttonText}>Get contact</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={() => router.push("/contacts" as Href)}
      >
        <Text style={styles.buttonText}>Create new contact</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.cardContainer,
          { flexDirection: isWide ? "row" : "column" },
        ]}
      >
        {CARDS.map((item) => (
          <View
            key={item}
            style={[
              styles.card,
              {
                width: isWide ? 50 : 150,
                height: isWide ? 50 : 150,
              },
            ]}
          >
            <Text style={styles.cardContent}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default DimensionTab;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    padding: 10,
    paddingBottom: 24,
    backgroundColor: "lightblue",
    flexGrow: 1,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: "#5856d6",
  },
  getContactButton: {
    backgroundColor: "#34c759",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardContainer: {
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#216778",
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  cardContent: {
    color: "white",
    fontSize: 24,
  },
});
