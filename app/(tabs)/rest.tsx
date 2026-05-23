import {
  createPost,
  deletePost,
  fetchPost,
  fetchPosts,
  getApiErrorMessage,
  POSTS_URL,
  type Post,
  updatePost,
  updatePostViaPost,
} from "@/lib/fakeApi";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RestScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastAction, setLastAction] = useState("");
  const [newTitle, setNewTitle] = useState("Мой пост из приложения");
  const [newBody, setNewBody] = useState("Текст создан через POST /posts");
  const [editPostId, setEditPostId] = useState("1");
  const [editUserId, setEditUserId] = useState("1");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [showCount, setShowCount] = useState(10);

  const fillEditForm = (post: Post) => {
    setEditPostId(String(post.id));
    setEditUserId(String(post.userId));
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "REST API",
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

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setLastAction("");
    try {
      const data = await fetchPosts();
      setPosts(data);
      setLastAction(`✓ GET ${POSTS_URL} — получено ${data.length} постов`);
    } catch (e) {
      const message = getApiErrorMessage(e);
      setLastAction(`✗ Ошибка: ${message}`);
      Alert.alert("Ошибка", `Не удалось загрузить данные:\n${message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const run = async (label: string, action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      if (!label.startsWith("GET")) {
        setLastAction(`✓ ${label}`);
      }
    } catch (e) {
      const message = getApiErrorMessage(e);
      setLastAction(`✗ ${label}: ${message}`);
      Alert.alert("Ошибка", message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetOne = () =>
    run("GET /posts/1", async () => {
      const post = await fetchPost(1);
      setPosts([post]);
      setShowCount(1);
      setLastAction(`✓ GET ${POSTS_URL}/1`);
    });

  const handlePost = () =>
    run("POST /posts", async () => {
      const created = await createPost({
        userId: 1,
        title: newTitle.trim() || "Без названия",
        body: newBody.trim() || "Без текста",
      });
      setPosts((prev) => [created, ...prev]);
      setShowCount((c) => c + 1);
    });

  const handleUpdatePost = () =>
    run("POST /posts (оновлення)", async () => {
      const id = Number.parseInt(editPostId, 10);
      const userId = Number.parseInt(editUserId, 10);

      if (!Number.isFinite(id) || id < 1) {
        throw new Error("Введіть коректний id поста");
      }
      if (!Number.isFinite(userId) || userId < 1) {
        throw new Error("Введіть коректний userId");
      }

      const title = editTitle.trim();
      const body = editBody.trim();
      if (!title) {
        throw new Error("Введіть заголовок поста");
      }

      const updated = await updatePostViaPost(id, {
        userId,
        title,
        body: body || "Без тексту",
      });

      setPosts((prev) => [updated, ...prev.filter((p) => p.id !== updated.id)]);
      setShowCount((c) => Math.max(c, 1));
      setLastAction(`✓ POST — пост #${updated.id} додано до списку`);
    });

  const handlePut = () =>
    run("PUT /posts/1", async () => {
      const updated = await updatePost(1, {
        userId: 1,
        title: "Обновлённый заголовок",
        body: "Обновлено через PUT",
      });
      setPosts((prev) =>
        prev.length > 0
          ? prev.map((p) => (p.id === 1 ? updated : p))
          : [updated],
      );
    });

  const handleDelete = () =>
    run("DELETE /posts/1", async () => {
      await deletePost(1);
      setPosts((prev) => prev.filter((p) => p.id !== 1));
    });

  const visiblePosts = posts.slice(0, showCount);

  const listHeader = (
    <>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <AntDesign name="api" size={28} color="#0f836a" />
          <Text style={styles.title}>JSONPlaceholder</Text>
        </View>
        <Text style={styles.url} selectable>
          {POSTS_URL}
        </Text>
        <Text style={styles.paragraph}>
          Запросы выполняются через axios (lib/fakeApi.tsx). При открытии
          экрана загружается массив из 100 постов в формате JSON.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>POST — створити пост</Text>
        <TextInput
          style={styles.input}
          placeholder="Заголовок"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Текст"
          value={newBody}
          onChangeText={setNewBody}
          multiline
        />
        <TouchableOpacity
          style={[styles.submitBtn, styles.submitGreen]}
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>Створити (POST)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Форма оновлення посту</Text>
        <Text style={styles.hintForm}>
          Заповніть поля та надішліть POST. У разі успіху пост з відповіді API
          з’явиться на початку списку.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="id поста"
          value={editPostId}
          onChangeText={setEditPostId}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="userId"
          value={editUserId}
          onChangeText={setEditUserId}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Заголовок"
          value={editTitle}
          onChangeText={setEditTitle}
        />
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Текст поста"
          value={editBody}
          onChangeText={setEditBody}
          multiline
        />
        <TouchableOpacity
          style={[styles.submitBtn, styles.submitOrange]}
          onPress={handleUpdatePost}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>Оновити (POST)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <ActionButton
          label="Обновить (GET)"
          color="#007AFF"
          onPress={() => loadPosts(true)}
          disabled={loading && !refreshing}
        />
        <ActionButton
          label="GET — один (id=1)"
          color="#5856d6"
          onPress={handleGetOne}
          disabled={loading}
        />
        <ActionButton
          label="PUT — обновить id=1"
          color="#ff9500"
          onPress={handlePut}
          disabled={loading}
        />
        <ActionButton
          label="DELETE — id=1"
          color="#ff3b30"
          onPress={handleDelete}
          disabled={loading}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.headerLoader}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.headerLoaderText}>Загрузка…</Text>
        </View>
      ) : null}

      {lastAction ? <Text style={styles.status}>{lastAction}</Text> : null}

      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>
          Данные с сервера ({visiblePosts.length}
          {posts.length > visiblePosts.length ? ` из ${posts.length}` : ""})
        </Text>
        {posts.length > showCount ? (
          <TouchableOpacity onPress={() => setShowCount((c) => c + 10)}>
            <Text style={styles.showMore}>Ещё 10</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка с{'\n'}{POSTS_URL}</Text>
      </View>
    );
  }

  const showOverlay = loading && posts.length > 0 && !refreshing;

  return (
    <View style={styles.screenRoot}>
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postMeta}>
              #{item.id} · user {item.userId}
            </Text>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postBody}>{item.body}</Text>
            <TouchableOpacity
              style={styles.fillFormBtn}
              onPress={() => fillEditForm(item)}
            >
              <Text style={styles.fillFormBtnText}>У форму оновлення</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={styles.emptyLoader}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.empty}>Загрузка…</Text>
            </View>
          ) : (
            <Text style={styles.empty}>
              Нет данных — потяните вниз для обновления
            </Text>
          )
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setShowCount(10);
              loadPosts(true);
            }}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      />

      {showOverlay ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingOverlayText}>Выполняется запрос…</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ActionButton({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: color }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: "#f5f5f5" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: { padding: 20, paddingBottom: 40 },
  headerBack: { paddingVertical: 4, paddingRight: 12 },
  headerBackText: { fontSize: 17, color: "#007AFF", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#111", flex: 1 },
  url: {
    fontSize: 13,
    color: "#0f836a",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  paragraph: { fontSize: 15, color: "#444", lineHeight: 22 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  showMore: { fontSize: 15, color: "#007AFF", fontWeight: "600" },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#111",
  },
  inputMultiline: { minHeight: 72, textAlignVertical: "top", paddingTop: 10 },
  actions: { gap: 10, marginBottom: 16 },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  status: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  empty: { textAlign: "center", color: "#8e8e93", fontSize: 15, paddingVertical: 12 },
  emptyLoader: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
  },
  headerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerLoaderText: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  loadingOverlayText: { fontSize: 15, color: "#333", fontWeight: "600" },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  postMeta: { fontSize: 12, color: "#888", marginBottom: 4 },
  postTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6 },
  postBody: { fontSize: 14, color: "#666", lineHeight: 20 },
  hintForm: { fontSize: 13, color: "#666", lineHeight: 18 },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitGreen: { backgroundColor: "#34c759" },
  submitOrange: { backgroundColor: "#ff9500" },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  fillFormBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  fillFormBtnText: { color: "#007AFF", fontSize: 13, fontWeight: "600" },
});
