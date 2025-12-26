import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export interface PasswordEntry {
    id: string;
    site: string;
    username: string;
    password: string; // Stored as plain text locally for now per MVP requirements
    category: 'Work' | 'Personal' | 'Social' | 'Finance' | 'Other';
    notes?: string;
    updatedAt: string;
}

export const usePasswords = () => {
    const [passwords, setPasswords] = useLocalStorage<PasswordEntry[]>('agenda_passwords', []);

    const addPassword = (entry: Omit<PasswordEntry, 'id' | 'updatedAt'>) => {
        const newEntry: PasswordEntry = {
            ...entry,
            id: uuidv4(),
            updatedAt: new Date().toISOString()
        };
        setPasswords([...passwords, newEntry]);
    };

    const updatePassword = (id: string, updates: Partial<Omit<PasswordEntry, 'id' | 'updatedAt'>>) => {
        setPasswords(passwords.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ));
    };

    const deletePassword = (id: string) => {
        setPasswords(passwords.filter(p => p.id !== id));
    };

    return {
        passwords,
        addPassword,
        updatePassword,
        deletePassword
    };
};
