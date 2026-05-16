import { Image, StyleSheet, Text, View } from "react-native";

import { useOrientation } from "@/hooks/useOrientation";

const avatarSource = require("@/assets/images/icon.png");

export function ProfileCard() {
  const orientation = useOrientation();
  const isLandscape = orientation === "landscape";

  return (
    <View
      style={[
        styles.card,
        isLandscape ? styles.cardLandscape : styles.cardPortrait,
      ]}
    >
      <Image source={avatarSource} style={styles.avatar} />
      <View
        style={[
          styles.info,
          isLandscape ? styles.infoLandscape : styles.infoPortrait,
        ]}
      >
        <Text style={[styles.name, isLandscape && styles.textLandscape]}>
          Черниш Сергій
        </Text>
        <Text style={[styles.role, isLandscape && styles.textLandscape]}>
          React Native Developer
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 520,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    gap: 20,
  },
  cardPortrait: {
    flexDirection: "column",
    alignItems: "center",
  },
  cardLandscape: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e8e8e8",
  },
  info: {
    gap: 8,
  },
  infoPortrait: {
    alignItems: "center",
  },
  infoLandscape: {
    flex: 1,
    alignItems: "flex-start",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c1c1e",
    textAlign: "center",
  },
  role: {
    fontSize: 16,
    color: "#007aff",
    fontWeight: "600",
    textAlign: "center",
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: "#636366",
    textAlign: "center",
  },
  textLandscape: {
    textAlign: "left",
  },
});
