import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export interface Reminder {
    id: string;
    text: string;
    targetDate: string; // YYYY-MM-DD
    time?: string;      // HH:mm
    details?: string;
    createdDate: string;
}

export function useReminders(currentDateKey: string) {
    const [reminders, setReminders] = useLocalStorage<Reminder[]>('agenda_reminders_all', []);

    const addReminder = (text: string, targetDate: string, time?: string, details?: string) => {
        const newReminder: Reminder = {
            id: uuidv4(),
            text,
            targetDate,
            time,
            details,
            createdDate: new Date().toISOString()
        };
        setReminders([...reminders, newReminder]);
    };

    const deleteReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    // Calculate active alerts for the current view date
    const getActiveAlerts = () => {
        const alerts: { reminder: Reminder, daysLeft: number, urgency: 'high' | 'medium' | 'low' }[] = [];
        const viewDate = parseISO(currentDateKey);

        reminders.forEach(r => {
            const target = parseISO(r.targetDate);
            const daysLeft = differenceInCalendarDays(target, viewDate);

            // Logic: 30, 15, 7, and <= 5 daily
            let shouldAlert = false;
            let urgency: 'high' | 'medium' | 'low' = 'low';

            if (daysLeft === 30) { shouldAlert = true; urgency = 'low'; }
            else if (daysLeft === 15) { shouldAlert = true; urgency = 'medium'; }
            else if (daysLeft === 7) { shouldAlert = true; urgency = 'high'; }
            else if (daysLeft <= 5 && daysLeft >= 0) { shouldAlert = true; urgency = 'high'; }

            if (shouldAlert) {
                alerts.push({ reminder: r, daysLeft, urgency });
            }
        });

        // Sort by urgency/proximity
        return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    };

    return {
        reminders,
        addReminder,
        deleteReminder,
        activeAlerts: getActiveAlerts()
    };
}
