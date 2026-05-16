import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

const CARDS = ["A", "B", "C", "D"];

const DimensionTab = () => {
  const { width, height } = useWindowDimensions();
  const isWide = width > height;

  return (
    <View style={[styles.container, isWide && styles.containerWide]}>
      <View
        style={[
          styles.cardsWrapper,
          isWide ? styles.cardsRow : styles.cardsColumn,
        ]}
      >
        {CARDS.map((label) => (
          <View key={label} style={styles.card}>
            <Text style={styles.cardText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DimensionTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c8e8e8",
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "flex-start",
  },
  containerWide: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
  },
  cardsWrapper: {
    gap: 14,
  },
  cardsColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 80,
    height: 80,
    backgroundColor: "#2d6b6b",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#ffffff",
  },
});
