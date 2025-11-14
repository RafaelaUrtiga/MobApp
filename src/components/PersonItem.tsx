import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Person } from "../../src/storage/db";

export function PersonItem({
  item,
  onPress,
}: {
  item: Person;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row}>
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={s.avatar} />
      ) : (
        <View style={[s.avatar, s.placeholder]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.name}</Text>
        {item.email ? <Text style={s.email}>{item.email}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  placeholder: { backgroundColor: "#ddd" },
  name: { fontWeight: "700" },
  email: { color: "#666" },
});

