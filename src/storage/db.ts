import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "./firebase";

const storage = getStorage();

// ========== TIPOS (INTERFACES) ==========

export interface Person {
  id: string;
  name: string;
  phone: string;
  email?: string;
  eventId?: string;
  photoUri?: string;
  createdAt?: Date;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  location?: string;
  description?: string;
  createdAt?: Date;
}

export interface Attendance {
  eventId: string;
  personId: string;
  present: boolean;
}

// ========== FUNÇÕES PARA EVENTOS ==========

export const listEvents = async (): Promise<Event[]> => {
  try {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      location: doc.data().location,
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return [];
  }
};

export const getEvent = async (id: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, "events", id);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) return null;
    
    const data = eventSnap.data();
    return {
      id: eventSnap.id,
      title: data.title,
      description: data.description,
      location: data.location,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate(),
    };
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    return null;
  }
};

export const addEvent = async (event: Omit<Event, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      date: Timestamp.fromDate(event.date),
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error("Erro ao adicionar evento:", error);
    throw error;
  }
};

export const updateEvent = async (id: string, event: Partial<Event>) => {
  try {
    const eventRef = doc(db, "events", id);
    const updateData: any = {};
    
    if (event.title !== undefined) updateData.title = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.location !== undefined) updateData.location = event.location;
    if (event.date) updateData.date = Timestamp.fromDate(event.date);
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await deleteDoc(doc(db, "events", id));
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    throw error;
  }
};

// ========== FUNÇÕES PARA PESSOAS ==========

export const listPeople = async (): Promise<Person[]> => {
  try {
    const q = query(collection(db, "people"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      phone: doc.data().phone,
      email: doc.data().email,
      eventId: doc.data().eventId,
      photoUri: doc.data().photoUri,
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Erro ao buscar pessoas:", error);
    return [];
  }
};

export const getPerson = async (id: string): Promise<Person | null> => {
  try {
    const personRef = doc(db, "people", id);
    const personSnap = await getDoc(personRef);
    
    if (!personSnap.exists()) return null;
    
    const data = personSnap.data();
    return {
      id: personSnap.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      eventId: data.eventId,
      photoUri: data.photoUri,
      createdAt: data.createdAt?.toDate(),
    };
  } catch (error) {
    console.error("Erro ao buscar pessoa:", error);
    return null;
  }
};

export const listPeopleByEvent = async (eventId: string): Promise<Person[]> => {
  try {
    const q = query(
      collection(db, "people"),
      where("eventId", "==", eventId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      phone: doc.data().phone,
      email: doc.data().email,
      eventId: doc.data().eventId,
      photoUri: doc.data().photoUri,
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Erro ao buscar pessoas por evento:", error);
    return [];
  }
};

export const addPerson = async (person: Omit<Person, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "people"), {
      name: person.name,
      phone: person.phone || "",
      email: person.email || "",
      eventId: person.eventId || "",
      photoUri: person.photoUri || "",
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...person };
  } catch (error) {
    console.error("Erro ao adicionar pessoa:", error);
    throw error;
  }
};

export const updatePerson = async (id: string, person: Partial<Person>) => {
  try {
    const personRef = doc(db, "people", id);
    const updateData: any = { ...person };
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(personRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar pessoa:", error);
    throw error;
  }
};

export const deletePerson = async (id: string) => {
  try {
    await deleteDoc(doc(db, "people", id));
  } catch (error) {
    console.error("Erro ao deletar pessoa:", error);
    throw error;
  }
};

// Upload de foto para Firebase Storage
export const uploadPersonPhoto = async (
  personId: string,
  photoUri: string
): Promise<string> => {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `people/${personId}/photo.jpg`);
    await uploadBytes(storageRef, blob);
    
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    throw error;
  }
};

// ========== FUNÇÕES PARA PRESENÇA (ATTENDANCE) ==========

export const listAttendanceByEvent = async (eventId: string): Promise<Attendance[]> => {
  try {
    const q = query(
      collection(db, "attendance"),
      where("eventId", "==", eventId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      eventId: doc.data().eventId,
      personId: doc.data().personId,
      present: doc.data().present,
    }));
  } catch (error) {
    console.error("Erro ao buscar presenças:", error);
    return [];
  }
};

export const setPresence = async (eventId: string, personId: string, present: boolean) => {
  try {
    const attendanceId = `${eventId}_${personId}`;
    await setDoc(doc(db, "attendance", attendanceId), {
      eventId,
      personId,
      present,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao definir presença:", error);
    throw error;
  }
};

// ========== OBJETO DB (para compatibilidade) ==========

export const DB = {
  listEvents,
  getEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  listPeople,
  getPerson,
  listPeopleByEvent,
  addPerson,
  updatePerson,
  deletePerson,
  uploadPersonPhoto,
  listAttendanceByEvent,
  setPresence,
};