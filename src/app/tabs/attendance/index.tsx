import { View, Text, FlatList, Switch, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { DB, Event, Person } from "../../../storage/db";

export default function AttendanceScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const ev = await DB.listEvents();
      setEvents(ev);

      const firstId = ev[0]?.id ?? null;
      setEventId(firstId);

      if (firstId) {
        const list = await DB.listPeopleByEvent(firstId); // já usa Firestore
        setPeople(list);

        const att = await DB.listAttendanceByEvent(firstId); // Firestore também
        const map: Record<string, boolean> = {};
        att.forEach((a) => {
          map[a.personId] = a.present;
        });
        setPresentMap(map);
      }
    })();
  }, []);

  const toggle = async (pid: string, val: boolean) => {
    if (!eventId) return;
    // otimista no estado
    setPresentMap((prev) => ({ ...prev, [pid]: val }));
    await DB.setPresence(eventId, pid, val); // grava no Firestore (attendance)
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: "700", marginBottom: 8 }}>
        Evento: {events.find((e) => e.id === eventId)?.title || "—"}
      </Text>

      <FlatList
        data={people}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Text style={{ flex: 1 }}>{item.name}</Text>
            <Switch
              value={!!presentMap[item.id]}
              onValueChange={(v) => toggle(item.id, v)}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Sem pessoas para este evento
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});