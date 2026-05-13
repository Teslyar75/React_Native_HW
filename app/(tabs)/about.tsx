import { FlatList, StyleSheet, Text, View } from "react-native";

interface Item {
  id: string;
  title: string;
}

export default function AboutTab() {
  // const data = [
  //   { id: "1", title: "item1" },
  //   { id: "2", title: "item2" },
  // ];
  const data = [] as Item[];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 50,
                color: "#8e8e93",
                fontSize: 16,
              }}
            >
              List is empty
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 15 },
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
  listItem: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#007aff",
    marginVertical: 8,
  },
  listItemText: { fontSize: 16 },
});
