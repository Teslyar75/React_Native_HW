import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

interface Item {
  id: string;
  title: string;
}

const samuraiSource = require("../../assets/images/Samuray.jpg");
const { width: samuraiWidth, height: samuraiHeight } =
  Image.resolveAssetSource(samuraiSource);
const samuraiAspectRatio = samuraiWidth / samuraiHeight;

export default function AboutTab() {
  const { width: windowWidth } = useWindowDimensions();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const updateImageSize = useCallback((width: number) => {
    if (width > 0) {
      setImageSize({
        width,
        height: width / samuraiAspectRatio,
      });
    }
  }, []);

  const handleImageWindowLayout = (event: LayoutChangeEvent) => {
    updateImageSize(event.nativeEvent.layout.width);
  };

  const data: Item[] = [
    { id: "1", title: "item1" },
    { id: "2", title: "item2" },
    { id: "3", title: "item3" },
    { id: "4", title: "item4" },
    { id: "5", title: "item5" },
    { id: "6", title: "item6" },
  ];
  const fadeAnim = useRef(data.map(() => new Animated.Value(0)));
  useEffect(() => {
    data.forEach((_, index) => {
      Animated.timing(fadeAnim.current[index], {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [data]);

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    return (
      <Animated.View
        style={[styles.listItem, { opacity: fadeAnim.current[index] }]}
      >
        <Text style={styles.listItemText}>{item.title}</Text>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View
          key={windowWidth}
          style={styles.imageWindow}
          onLayout={handleImageWindowLayout}
        >
          {imageSize.width > 0 ? (
            <Image
              source={samuraiSource}
              style={{
                width: imageSize.width,
                height: imageSize.height,
              }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </View>
      <View style={styles.card}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 20, gap: 15, flexGrow: 1 },
  imageWindow: {
    width: "100%",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
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
