import {
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Section {
  title: string;
  data: string[];
}

const ListsTab = () => {
  const insets = useSafeAreaInsets();
  const data: Section[] = [
    {
      title: "Category1",
      data: ["item1", "item2", "item3", "item4"],
    },
    {
      title: "Category2",
      data: ["item1", "item2", "item3", "item4"],
    },
    {
      title: "Category3",
      data: ["item1", "item2", "item3", "item4"],
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar
        barStyle="default"
        backgroundColor="#138539"
        translucent={false}
      />
      <View style={styles.card}>
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          sections={data}
          keyExtractor={(item, index) => item + index}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default ListsTab;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 15 },
  headerRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    gap: 10,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
  itemRow: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    marginBottom: 5,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#007aff",
    borderLeftWidth: 2,
    borderLeftColor: "#007aff",
  },
  itemText: { fontSize: 16 },
});
