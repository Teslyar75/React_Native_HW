import { StyleSheet, View } from "react-native";

import { ProfileCard } from "@/components/profile-card";
import { useOrientation } from "@/hooks/useOrientation";

export default function ProfileTab() {
  const orientation = useOrientation();

  return (
    <View
      style={[
        styles.container,
        orientation === "landscape" && styles.containerLandscape,
      ]}
    >
      <ProfileCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  containerLandscape: {
    justifyContent: "center",
  },
});
