import { useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

type Task = {
  id: string;
  title: string;
};

function generateTaskId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function TasksScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Список задач",
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBack}
          hitSlop={12}
        >
          <Text style={styles.headerBackText}>‹ Назад</Text>
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const showAddedToast = () => {
    const message = "Задачу додано";
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  const showSavedToast = () => {
    const message = "Зміни збережено";
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  const addTask = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) {
      Alert.alert("Помилка", "Введіть текст завдання.");
      return;
    }
    setTasks((prev) => [...prev, { id: generateTaskId(), title: trimmed }]);
    setNewTaskText("");
    showAddedToast();
  };

  const removeTaskConfirmed = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditDraft("");
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const requestRemoveTask = (id: string) => {
    Alert.alert("Видалити?", "Ви впевнені?", [
      { text: "Ні", style: "cancel" },
      {
        text: "Так",
        style: "destructive",
        onPress: () => removeTaskConfirmed(id),
      },
    ]);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditDraft(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    if (!trimmed) {
      Alert.alert("Помилка", "Текст завдання не може бути порожнім.");
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t)),
    );
    cancelEdit();
    showSavedToast();
  };

  const inputCommon = {
    autoCorrect: true,
    autoCapitalize: "sentences" as const,
    keyboardType: "default" as const,
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <View style={styles.card}>
          <Text style={styles.hint}>
            Можна вводити кирилицю та латиницю. Поле підтримує стандартну
            клавіатуру пристрою.
          </Text>
          <TextInput
            {...inputCommon}
            style={styles.input}
            placeholder="Нова задача (укр. / eng)"
            placeholderTextColor="#999"
            value={newTaskText}
            onChangeText={setNewTaskText}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addBtnText}>Додати</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionLabel}>Ваші завдання</Text>
      </View>
    ),
    [newTaskText],
  );

  const renderTask = ({ item: task }: { item: Task }) => (
    <View style={styles.taskCard}>
      {editingId === task.id ? (
        <>
          <TextInput
            {...inputCommon}
            style={styles.input}
            value={editDraft}
            onChangeText={setEditDraft}
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveBtnText}>Зберегти</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
              <Text style={styles.cancelBtnText}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.taskText}>{task.title}</Text>
          <View style={styles.rowActions}>
            <TouchableOpacity
              style={styles.editOutline}
              onPress={() => startEdit(task)}
            >
              <Text style={styles.editOutlineText}>Редагувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => requestRemoveTask(task.id)}
            >
              <Text style={styles.deleteBtnText}>Видалити</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.screenRoot}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={styles.empty}>Поки немає задач</Text>
        }
        keyboardShouldPersistTaps="handled"
        extraData={{ editingId, editDraft }}
        nestedScrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerBlock: { marginBottom: 4 },
  headerBack: { paddingVertical: 4, paddingRight: 12 },
  headerBackText: { fontSize: 17, color: "#007AFF", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    gap: 12,
    marginBottom: 16,
  },
  hint: { fontSize: 14, color: "#666", lineHeight: 20 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 17,
    color: "#111",
  },
  addBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },
  empty: {
    textAlign: "center",
    color: "#8e8e93",
    fontSize: 16,
    paddingVertical: 12,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  taskText: { fontSize: 17, color: "#111", marginBottom: 10 },
  rowActions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  editOutline: {
    borderWidth: 1,
    borderColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  editOutlineText: { color: "#007AFF", fontWeight: "600" },
  deleteBtn: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtnText: { color: "#fff", fontWeight: "600" },
  editActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#34c759",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#e5e5ea",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: { color: "#333", fontWeight: "600" },
});
