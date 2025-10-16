import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { DB, Event } from "../../../src/storage/db";
import { EventItem } from "../../../src/components/EventItem";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);

  const load = async () => setEvents(await DB.listEvents());

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={events}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <EventItem
            item={item}
            onPress={() => router.push(`/tabs/events/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Nenhum evento
          </Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push("/tabs/events/new")}
      >
        <Ionicons name="add" color="#fff" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#0066cc",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
});
