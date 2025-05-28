import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export interface EventType {
  id: string;
  title: string;
  time: string;
  date: Date;
}

export const useEvents = (): EventType[] => {
  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          time: data.time,
          date: new Date(data.date),
        };
      });
      setEvents(fetched);
    });

    return () => unsub();
  }, []);

  return events;
};
