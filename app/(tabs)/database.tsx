import { dbManager, type Product } from "@/lib/bd";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

function formatPrice(price: number): string {
  return `${price.toFixed(2)} ₴`;
}

export default function DatabaseScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceText, setPriceText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriceText, setEditPriceText] = useState("");
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "База данных",
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

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      const rows = await dbManager.getAllProducts();
      setProducts(rows);
    } catch {
      Alert.alert("Ошибка", "Не удалось загрузить товары из базы.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await dbManager.init();
        if (!cancelled) await loadProducts();
      } catch {
        if (!cancelled) {
          Alert.alert("Ошибка", "Не удалось инициализировать базу данных.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadProducts]);

  const addProduct = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const price = Number.parseFloat(priceText.replace(",", "."));

    if (!trimmedTitle) {
      Alert.alert("Ошибка", "Введите название товара.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      Alert.alert("Ошибка", "Введите корректную цену (число ≥ 0).");
      return;
    }

    setSaving(true);
    try {
      await dbManager.addProduct({
        title: trimmedTitle,
        description: trimmedDescription,
        price,
        created_at: Date.now(),
      });
      setTitle("");
      setDescription("");
      setPriceText("");
      await loadProducts();
      showToast("Товар добавлен");
    } catch {
      Alert.alert("Ошибка", "Не удалось сохранить товар.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: Product) => {
    if (!product.id) return;
    setEditingId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description ?? "");
    setEditPriceText(String(product.price));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriceText("");
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    const price = Number.parseFloat(editPriceText.replace(",", "."));

    if (!trimmedTitle) {
      Alert.alert("Ошибка", "Введите название товара.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      Alert.alert("Ошибка", "Введите корректную цену (число ≥ 0).");
      return;
    }

    setSaving(true);
    try {
      await dbManager.updateProduct(editingId, {
        title: trimmedTitle,
        description: trimmedDescription,
        price,
      });
      cancelEdit();
      await loadProducts();
      showToast("Изменения сохранены");
    } catch {
      Alert.alert("Ошибка", "Не удалось сохранить изменения.");
    } finally {
      setSaving(false);
    }
  };

  const viewProduct = async (product: Product) => {
    if (!product.id) return;
    try {
      const row = await dbManager.getProductById(product.id);
      if (row) {
        setViewingProduct(row);
      } else {
        Alert.alert("Помилка", "Товар не знайдено.");
        await loadProducts();
      }
    } catch {
      Alert.alert("Помилка", "Не вдалося прочитати товар.");
    }
  };

  const requestDelete = (product: Product) => {
    if (!product.id) return;
    Alert.alert("Удалить?", `Убрать «${product.title}» из списка?`, [
      { text: "Нет", style: "cancel" },
      {
        text: "Да",
        style: "destructive",
        onPress: async () => {
          try {
            if (editingId === product.id) cancelEdit();
            await dbManager.deleteProduct(product.id!);
            await loadProducts();
            showToast("Товар удалён");
          } catch {
            Alert.alert("Ошибка", "Не удалось удалить товар.");
          }
        },
      },
    ]);
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <View style={styles.card}>
          <Text style={styles.crudBadge}>CRUD · SQLite</Text>
          <Text style={styles.hint}>
            Локальная SQLite-база (shop.db). Create, Read, Update, Delete для
            товаров.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Название"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Описание (необязательно)"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Цена"
            placeholderTextColor="#999"
            value={priceText}
            onChangeText={setPriceText}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.addBtn, saving && styles.addBtnDisabled]}
            onPress={addProduct}
            disabled={saving}
          >
            <Text style={styles.addBtnText}>
              {saving ? "Сохранение…" : "Create — додати товар"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionLabel}>Товары в базе</Text>
      </View>
    ),
    [title, description, priceText, saving],
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      {editingId === item.id ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Название"
            placeholderTextColor="#999"
            value={editTitle}
            onChangeText={setEditTitle}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Описание"
            placeholderTextColor="#999"
            value={editDescription}
            onChangeText={setEditDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Цена"
            placeholderTextColor="#999"
            value={editPriceText}
            onChangeText={setEditPriceText}
            keyboardType="decimal-pad"
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.addBtnDisabled]}
              onPress={saveEdit}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Сохранение…" : "Сохранить"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
              <Text style={styles.cancelBtnText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.productTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.productDesc}>{item.description}</Text>
          ) : null}
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.rowActions}>
            <TouchableOpacity
              style={styles.readBtn}
              onPress={() => viewProduct(item)}
            >
              <Text style={styles.readBtnText}>Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editOutline}
              onPress={() => startEdit(item)}
            >
              <Text style={styles.editOutlineText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => requestDelete(item)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка базы…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenRoot}>
      {viewingProduct ? (
        <View style={styles.viewModal}>
          <View style={styles.viewCard}>
            <Text style={styles.viewTitle}>Read — товар</Text>
            <Text style={styles.viewLabel}>ID</Text>
            <Text style={styles.viewValue}>{viewingProduct.id}</Text>
            <Text style={styles.viewLabel}>Назва</Text>
            <Text style={styles.viewValue}>{viewingProduct.title}</Text>
            <Text style={styles.viewLabel}>Опис</Text>
            <Text style={styles.viewValue}>
              {viewingProduct.description || "—"}
            </Text>
            <Text style={styles.viewLabel}>Ціна</Text>
            <Text style={styles.viewValue}>
              {formatPrice(viewingProduct.price)}
            </Text>
            <TouchableOpacity
              style={styles.viewCloseBtn}
              onPress={() => setViewingProduct(null)}
            >
              <Text style={styles.viewCloseBtnText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={products}
        keyExtractor={(item) => item.id ?? String(item.created_at)}
        renderItem={renderProduct}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={styles.empty}>Пока нет товаров — добавьте первый</Text>
        }
        keyboardShouldPersistTaps="handled"
        extraData={{
          editingId,
          editTitle,
          editDescription,
          editPriceText,
          saving,
          viewingProduct,
        }}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    gap: 12,
  },
  loadingText: { fontSize: 16, color: "#666" },
  list: { flex: 1 },
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
  crudBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5856d6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  inputMultiline: { minHeight: 72, textAlignVertical: "top" },
  addBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnDisabled: { opacity: 0.6 },
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
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#5856d6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    gap: 6,
  },
  productTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  productDesc: { fontSize: 15, color: "#666", lineHeight: 20 },
  productPrice: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
  rowActions: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },
  readBtn: {
    backgroundColor: "#5856d6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  readBtnText: { color: "#fff", fontWeight: "600" },
  viewModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
    zIndex: 10,
  },
  viewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    gap: 6,
  },
  viewTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111" },
  viewLabel: { fontSize: 12, color: "#888", marginTop: 6 },
  viewValue: { fontSize: 16, color: "#111" },
  viewCloseBtn: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  viewCloseBtnText: { color: "#fff", fontWeight: "700" },
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
  editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
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
