import * as Contacts from "expo-contacts";
import { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface CreatedContact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
}

const emptyForm = () => ({
  firstName: "",
  lastName: "",
  phone: "",
});

const buildContactData = (
  trimmedFirst: string,
  trimmedLast: string,
  trimmedPhone: string,
) => {
  const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(" ");

  return {
    contactType: Contacts.ContactTypes.Person,
    name: fullName,
    firstName: trimmedFirst,
    lastName: trimmedLast,
    phoneNumbers: trimmedPhone
      ? [{ label: "mobile", number: trimmedPhone }]
      : [],
  };
};

const CARDS = ["A", "B", "C", "D"];

const DimensionTab = () => {
  const dimension = useWindowDimensions();
  const isWide = dimension.width > 500;

  const [showForm, setShowForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [createdContacts, setCreatedContacts] = useState<CreatedContact[]>([]);

  const resetForm = () => {
    const cleared = emptyForm();
    setFirstName(cleared.firstName);
    setLastName(cleared.lastName);
    setPhone(cleared.phone);
    setEditingContactId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    if (showForm && !editingContactId) {
      resetForm();
      return;
    }
    const cleared = emptyForm();
    setEditingContactId(null);
    setFirstName(cleared.firstName);
    setLastName(cleared.lastName);
    setPhone(cleared.phone);
    setShowForm(true);
  };

  const openEditForm = (contact: CreatedContact) => {
    setEditingContactId(contact.id);
    setFirstName(contact.firstName);
    setLastName(contact.lastName);
    setPhone(contact.phone === "—" ? "" : contact.phone);
    setShowForm(true);
  };

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

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

  const ensureContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Помилка", "Немає доступу до контактів");
      return false;
    }
    return true;
  };

  const handleSaveContact = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirst && !trimmedLast) {
      Alert.alert("Помилка", "Введіть ім'я або прізвище");
      return;
    }

    if (!(await ensureContactsPermission())) return;

    const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(" ");
    const displayPhone = trimmedPhone || "—";

    try {
      if (editingContactId) {
        await Contacts.updateContactAsync({
          id: editingContactId,
          ...buildContactData(trimmedFirst, trimmedLast, trimmedPhone),
        });

        setCreatedContacts((prev) =>
          prev.map((contact) =>
            contact.id === editingContactId
              ? {
                  ...contact,
                  firstName: trimmedFirst,
                  lastName: trimmedLast,
                  name: fullName,
                  phone: displayPhone,
                }
              : contact,
          ),
        );
        resetForm();
        showToast("Контакт оновлено");
        return;
      }

      const contactId = await Contacts.addContactAsync(
        buildContactData(trimmedFirst, trimmedLast, trimmedPhone),
      );

      setCreatedContacts((prev) => [
        ...prev,
        {
          id: contactId || `${Date.now()}`,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          name: fullName,
          phone: displayPhone,
        },
      ]);

      resetForm();
      showToast("Контакт створено");
    } catch {
      Alert.alert(
        "Помилка",
        editingContactId
          ? "Не вдалося оновити контакт"
          : "Не вдалося створити контакт",
      );
    }
  };

  const handleDeleteContact = (contact: CreatedContact) => {
    Alert.alert(
      "Видалити контакт?",
      `Видалити ${contact.name}?`,
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            if (!(await ensureContactsPermission())) return;

            try {
              await Contacts.removeContactAsync(contact.id);
              setCreatedContacts((prev) =>
                prev.filter((item) => item.id !== contact.id),
              );
              if (editingContactId === contact.id) {
                resetForm();
              }
              showToast("Контакт видалено");
            } catch {
              Alert.alert("Помилка", "Не вдалося видалити контакт");
            }
          },
        },
      ],
    );
  };

  const renderContact = ({ item }: { item: CreatedContact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.contactActionButton, styles.editButton]}
          onPress={() => openEditForm(item)}
        >
          <Text style={styles.contactActionText}>Редагувати</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactActionButton, styles.deleteButton]}
          onPress={() => handleDeleteContact(item)}
        >
          <Text style={styles.contactActionText}>Видалити</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
          onPress={openCreateForm}
        >
          <Text style={styles.buttonText}>Create new contact</Text>
        </TouchableOpacity>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingContactId ? "Редагувати контакт" : "Новий контакт"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ім'я"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Прізвище"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Телефон"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, styles.saveButton]}
                onPress={handleSaveContact}
              >
                <Text style={styles.buttonText}>Зберегти</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.buttonText}>Скасувати</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <Text style={styles.listTitle}>Створені контакти</Text>
        {createdContacts.length === 0 ? (
          <Text style={styles.emptyText}>Поки що немає контактів</Text>
        ) : (
          <FlatList
            data={createdContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            scrollEnabled={false}
            style={styles.contactsList}
          />
        )}

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
    </KeyboardAvoidingView>
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
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1c1e",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c7c7cc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#34c759",
  },
  cancelButton: {
    backgroundColor: "#8e8e93",
  },
  listTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1c1c1e",
    marginBottom: 8,
  },
  emptyText: {
    color: "#636366",
    marginBottom: 16,
    fontSize: 15,
  },
  contactsList: {
    marginBottom: 16,
  },
  contactItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007aff",
    gap: 10,
  },
  contactInfo: {
    gap: 4,
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  contactActionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#007aff",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  contactActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
  },
  contactPhone: {
    fontSize: 14,
    color: "#636366",
    marginTop: 4,
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
