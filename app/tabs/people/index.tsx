import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useCallback, useState } from "react";
import { DB, Event, Person } from "../../../src/storage/db";
import { PersonItem } from "../../../src/components/PersonItem";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

export default function PeopleList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const load = useCallback(async () => {
    const ev = await DB.listEvents();
    setEvents(ev);
    const evId = ev[0]?.id || null;
    setSelectedEvent(evId);
    if (evId) {
      const peopleData = await DB.listPeopleByEvent(evId);
      setPeople(peopleData);
    } else {
      setPeople([]);
    }
  }, []);

  // Recarrega dados sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Atualiza lista de pessoas quando o evento selecionado mudar
  const loadPeopleForEvent = useCallback(async () => {
    if (selectedEvent) {
      const peopleData = await DB.listPeopleByEvent(selectedEvent);
      setPeople(peopleData);
    }
  }, [selectedEvent]);

  useFocusEffect(
    useCallback(() => {
      loadPeopleForEvent();
    }, [loadPeopleForEvent])
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: "700", marginBottom: 8 }}>
        Evento selecionado:{" "}
        {events.find((e) => e.id === selectedEvent)?.title || "—"}
      </Text>
      <FlatList
        data={people}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <PersonItem
            item={item}
            onPress={() => router.push(`/tabs/people/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Nenhuma pessoa
          </Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push("/tabs/people/new")}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
