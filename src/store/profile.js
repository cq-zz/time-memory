/**
 * Profile store — avatar + nickname, persisted through the settings
 * key-value layer (keys `profile.avatar` / `profile.nickname`) so it
 * works identically on native (SQLite) and web (AsyncStorage).
 */
import { create } from 'zustand';
import { loadSettingsRows, saveSettingRow } from './db';

export const NICKNAME_MAX = 20;

const AVATAR_KEY = 'profile.avatar';
const NICKNAME_KEY = 'profile.nickname';

export const useProfileStore = create((set) => ({
  avatar: '',
  nickname: '',
  loaded: false,

  /** Load persisted profile; empty strings when nothing was saved yet. */
  loadProfile: async () => {
    try {
      const rows = await loadSettingsRows();
      const map = {};
      rows.forEach((row) => {
        try {
          map[row.key] = JSON.parse(row.value);
        } catch {
          /* skip corrupted row */
        }
      });
      set({
        avatar: typeof map[AVATAR_KEY] === 'string' ? map[AVATAR_KEY] : '',
        nickname: typeof map[NICKNAME_KEY] === 'string' ? map[NICKNAME_KEY] : '',
        loaded: true,
      });
    } catch (e) {
      console.warn('[profile] load failed:', e);
      set({ loaded: true });
    }
  },

  /** Update avatar and/or nickname; memory first, then persist each provided field. */
  updateProfile: async (patch) => {
    const { avatar, nickname } = patch || {};
    set((state) => ({
      avatar: avatar !== undefined ? avatar : state.avatar,
      nickname: nickname !== undefined ? nickname : state.nickname,
    }));
    try {
      if (avatar !== undefined) await saveSettingRow(AVATAR_KEY, JSON.stringify(avatar));
      if (nickname !== undefined) await saveSettingRow(NICKNAME_KEY, JSON.stringify(nickname));
    } catch (e) {
      console.warn('[profile] persist failed:', e);
    }
  },
}));
