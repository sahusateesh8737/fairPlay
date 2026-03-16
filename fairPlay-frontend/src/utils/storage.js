// Utility functions for managing LocalStorage state during frontend-only testing

const KEYS = {
  IPS: 'fp_whitelisted_ips',
  SECTIONS: 'fp_sections',
  ASSIGNMENTS: 'fp_assignments'
};

// Initial Mock States if DB is empty
const defaultIps = [
  { id: 1, address: '192.168.1.1', desc: 'Main Campus Library', status: 'active', addedAt: '2023-10-12' },
];

const defaultSections = [
  { id: 1, code: 'k23DJ', studentsCount: 45, status: 'active', createdBy: 'Admin' },
  { id: 2, code: 'k23IS', studentsCount: 38, status: 'active', createdBy: 'Admin' },
];

const defaultAssignments = [];

// Generic Getters/Setters
export const getItem = (key, defaultData) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultData;
  }
};

export const setItem = (key, data) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

// Data Specific Helpers
export const getIps = () => getItem(KEYS.IPS, defaultIps);
export const saveIps = (ips) => setItem(KEYS.IPS, ips);

export const getSections = () => getItem(KEYS.SECTIONS, defaultSections);
export const saveSections = (sections) => setItem(KEYS.SECTIONS, sections);

export const getAssignments = () => getItem(KEYS.ASSIGNMENTS, defaultAssignments);
export const saveAssignments = (assignments) => setItem(KEYS.ASSIGNMENTS, assignments);
