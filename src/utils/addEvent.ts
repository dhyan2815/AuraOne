// utils/addEvent.ts
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const addEvent = async  (
  userId: string,
  title: string,
  time: string,
  date: Date
  
) => {

  if (!userId) throw new Error('User not authenticated');

  await addDoc(collection(db, 'users', userId, 'events'), {
    title,
    time,
    date: date.toISOString()
  });
};