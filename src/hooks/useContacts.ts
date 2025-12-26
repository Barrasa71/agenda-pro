import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export interface Contact {
    id: string;
    name: string;
    phone: string;
    email: string;
    company: string;
    notes: string;
    birthday?: string; // ISO Date string
    category: 'personal' | 'work' | 'vip' | 'other';
}

export const useContacts = () => {
    const [contacts, setContacts] = useLocalStorage<Contact[]>('agenda_contacts', []);

    const addContact = (contact: Omit<Contact, 'id'>) => {
        const newContact = { ...contact, id: uuidv4() };
        setContacts([...contacts, newContact]);
    };

    const updateContact = (id: string, updatedContact: Partial<Contact>) => {
        setContacts(contacts.map(c => c.id === id ? { ...c, ...updatedContact } : c));
    };

    const deleteContact = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    return {
        contacts,
        addContact,
        updateContact,
        deleteContact
    };
};
