/**
 * Mood check-in store — today's mood + full record list.
 * Persisted through the platform db layer (SQLite native / AsyncStorage web).
 */
import { create } from 'zustand';
import { getAllCheckIns, upsertCheckIn } from './db';

/** Local-timezone YYYY-MM-DD (avoids UTC drift from toISOString). */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useMoodStore = create((set, get) => ({
  todayMood: null, // mood key checked in today, or null
  records: [], // [{ check_date, mood, created_at }] sorted asc
  loaded: false,

  /** Load all check-in records and derive today's mood. */
  loadMoods: async () => {
    try {
      const rows = await getAllCheckIns();
      const today = todayStr();
      const rec = rows.find((r) => r.check_date === today);
      set({ records: rows, todayMood: rec ? rec.mood : null, loaded: true });
    } catch (e) {
      console.warn('[mood] load failed:', e);
      set({ loaded: true });
    }
  },

  /** Save (or overwrite) the mood for a date — defaults to today. */
  saveMood: async (moodKey, date) => {
    const checkDate = date || todayStr();
    await upsertCheckIn(checkDate, moodKey);
    const records = [...get().records];
    const idx = records.findIndex((r) => r.check_date === checkDate);
    if (idx >= 0) {
      records[idx] = { ...records[idx], mood: moodKey };
    } else {
      records.push({ check_date: checkDate, mood: moodKey, created_at: new Date().toISOString() });
    }
    records.sort((a, b) => (a.check_date < b.check_date ? -1 : 1));
    set((state) => ({
      records,
      todayMood: checkDate === todayStr() ? moodKey : state.todayMood,
    }));
  },
}));
