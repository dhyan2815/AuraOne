// utils/addEvent.ts
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../dist/services/firebase';

export const addEvent = async (title: string, time: string, date: Date) => {
  await addDoc(collection(db, 'events'), {
    title,
    time,
    date: date.toISOString(),
  });
};
