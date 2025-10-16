import AsyncStorage from "@react-native-async-storage/async-storage";

export type Event = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
};
export type Person = {
  id: string;
  name: string;
  email?: string;
  photoUri?: string;
  eventId: string;
};
export type Attendance = {
  eventId: string;
  personId: string;
  present: boolean;
};

const KEYS = {
  events: "events",
  people: "people",
  attendance: "attendance",
};

async function get<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function set<T>(key: string, data: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const DB = {
  // Events
  listEvents: () => get<Event>(KEYS.events),
  saveEvent: async (e: Partial<Event> & { id?: string }) => {
    const data = await get<Event>(KEYS.events);
    if (e.id) {
      const idx = data.findIndex((d) => d.id === e.id);
      data[idx] = { ...(data[idx] || {}), ...e } as Event;
    } else {
      data.push({
        id: Date.now().toString(),
        title: e.title || "",
        date: e.date || new Date().toISOString(),
        location: e.location,
        description: e.description,
      });
    }
    await set(KEYS.events, data);
  },
  getEvent: async (id: string) =>
    (await get<Event>(KEYS.events)).find((e) => e.id === id),

  // People
  listPeople: () => get<Person>(KEYS.people),
  listPeopleByEvent: async (eventId: string) =>
    (await get<Person>(KEYS.people)).filter((p) => p.eventId === eventId),
  savePerson: async (p: Partial<Person> & { id?: string }) => {
    const data = await get<Person>(KEYS.people);
    if (p.id) {
      const idx = data.findIndex((d) => d.id === p.id);
      data[idx] = { ...(data[idx] || {}), ...p } as Person;
    } else {
      data.push({
        id: Date.now().toString(),
        name: p.name || "",
        email: p.email,
        photoUri: p.photoUri,
        eventId: p.eventId!,
      });
    }
    await set(KEYS.people, data);
  },

  // Attendance
  listAttendanceByEvent: async (eventId: string) =>
    (await get<Attendance>(KEYS.attendance)).filter(
      (a) => a.eventId === eventId
    ),
  setPresence: async (eventId: string, personId: string, present: boolean) => {
    const data = await get<Attendance>(KEYS.attendance);
    const idx = data.findIndex(
      (a) => a.eventId === eventId && a.personId === personId
    );
    if (idx >= 0) data[idx].present = present;
    else data.push({ eventId, personId, present });
    await set(KEYS.attendance, data);
  },
};
