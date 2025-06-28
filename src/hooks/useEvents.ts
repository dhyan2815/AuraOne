// hooks/useEvents.tsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../services/firebase";

// Event type definition
export interface EventType {
  id: string;
  title: string;
  time: string;
  date: Date;
}

// Hook to fetch events
export const useEvents = (userId: string): EventType[] => {

  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(collection(db, "users", userId, "events"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          time: data.time,
          date: data.date,
        };
      });
      setEvents(fetched);
    });

    return () => unsub();
  }, [userId]);

  return events;
};

// Function to add an event
export const addEvent = async (
  userId: string,
  title: string,
  time: string,
  date: Date
): Promise<void> => {
  if (!userId) throw new Error("User not authenticated");

  await addDoc(collection(db, "users", userId, "events"), {
    title,
    time,
    date: date.toISOString(),
  });
};

// Function to delete an event
export const deleteEvent = async (
  userId: string,
  eventId: string
): Promise<void> => {
  if (!userId) throw new Error("User not authenticated");

  const eventRef = doc(db, "users", userId, "events", eventId);
  await deleteDoc(eventRef);
};
