import { View, Text, FlatList, Switch, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { DB, Event, Person } from "../../../src/storage/db";

export default function AttendanceScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const ev = await DB.listEvents();
      setEvents(ev);
      const id = ev[0]?.id ?? null;
      setEventId(id);
      if (id) {
        const list = await DB.listPeopleByEvent(id);
        setPeople(list);
        const att = await DB.listAttendanceByEvent(id);
        const map: Record<string, boolean> = {};
        att.forEach((a) => (map[a.personId] = a.present));
        setPresentMap(map);
      }
    })();
  }, []);

  const toggle = async (pid: string, val: boolean) => {
    if (!eventId) return;
    setPresentMap((p) => ({ ...p, [pid]: val }));
    await DB.setPresence(eventId, pid, val);
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
