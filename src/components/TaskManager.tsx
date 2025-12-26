import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CheckCircle2, Circle, Trash2, Flag, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    date: string;
    priority: 'high' | 'normal' | 'low';
}

interface TaskManagerProps {
    dateKey: string; // YYYY-MM-DD
    onGoToDate?: (date: Date) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ dateKey, onGoToDate }) => {
    // Current day's tasks
    const [tasks, setTasks] = useLocalStorage<Task[]>(`agenda_tasks_${dateKey}`, []);

    // UI State
    const [newTaskText, setNewTaskText] = useState('');
    const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
    const [showForm, setShowForm] = useState(false);

    // -------------------------------------------------------------------------
    // CORE LOGIC: PERSISTENT HISTORY ENGINE
    // -------------------------------------------------------------------------

    // Helper: Normalize text to identify the "Same Task" across days
    const getBaseText = (text: string) => {
        return text.split(' (📅')[0].trim();
    };

    React.useEffect(() => {
        // This function enforces the "Universal Truth" of tasks across time.
        const synchronizeHistory = () => {
            try {
                const viewingDateStr = dateKey;
                const viewingDateObj = parseISO(dateKey);

                // 1. GATHER ALL HISTORY
                const allStorageKeys = Object.keys(window.localStorage);
                const agendaKeys = allStorageKeys.filter(k => k.startsWith('agenda_tasks_'));

                // We need to track two things for every unique task (identified by text):
                // A. When was it FIRST created? (For the tag)
                // B. What is its STATUS in the LATEST date it exists?

                const taskOrigins = new Map<string, string>(); // Text -> First Date Found
                const taskLatestState = new Map<string, { completed: boolean, date: string, rawTask: Task }>(); // Text -> Latest Info

                agendaKeys.forEach(key => {
                    const datePart = key.replace('agenda_tasks_', '');
                    const raw = window.localStorage.getItem(key);
                    if (!raw) return;

                    const dayTasks: Task[] = JSON.parse(raw);
                    const dayDateObj = parseISO(datePart);

                    dayTasks.forEach(t => {
                        const base = getBaseText(t.text);

                        // A. Check Origin (Oldest Date)
                        if (!taskOrigins.has(base) || dayDateObj < parseISO(taskOrigins.get(base)!)) {
                            taskOrigins.set(base, datePart);
                        }

                        // B. Check Latest State (Newest Date)
                        // defined as: if we haven't seen it, OR this date is newer than what we have seen
                        if (!taskLatestState.has(base) || dayDateObj > parseISO(taskLatestState.get(base)!.date)) {
                            taskLatestState.set(base, {
                                completed: t.completed,
                                date: datePart,
                                rawTask: t
                            });
                        }
                    });
                });

                // 2. APPLY LOGIC TO CURRENT VIEW (Today)
                // We need to determine what SHOULD be here.

                // Read fresh current data directly from storage to avoid race conditions
                const currentDataRaw = window.localStorage.getItem(`agenda_tasks_${viewingDateStr}`);
                let currentTasks: Task[] = currentDataRaw ? JSON.parse(currentDataRaw) : [];


                // Set of tasks currently in this day (for fast lookup)
                const currentBaseSet = new Set(currentTasks.map(t => getBaseText(t.text)));

                const tasksToAdd: Task[] = [];

                taskLatestState.forEach((latestInfo, baseText) => {
                    const latestDateObj = parseISO(latestInfo.date);
                    const originDateStr = taskOrigins.get(baseText)!;

                    // CASE 1: CARRY OVER
                    // The task exists in the PAST (strictly before today), 
                    // and its LATEST known state is INCOMPLETE.
                    // It MUST be present today.
                    if (latestDateObj < viewingDateObj && !latestInfo.completed) {
                        if (!currentBaseSet.has(baseText)) {
                            // Construct the task for today
                            const originDateObj = parseISO(originDateStr);
                            const formattedOrigin = format(originDateObj, 'dd/MM');
                            const displayText = `${baseText} (📅 ${formattedOrigin})`;

                            tasksToAdd.push({
                                ...latestInfo.rawTask,
                                id: uuidv4(), // Fresh ID for today
                                date: viewingDateStr,
                                completed: false, // It comes as incomplete
                                text: displayText
                            });
                        }
                    }

                    // CASE 2: CLEANUP (Stopping the ghost)
                    // If we have a task here today, BUT the history says it was completed in the FUTURE
                    // (Imagine user went to tomorrow, completed it, came back to today).
                    // This is rare but creates consistency. 
                    // For now, we prioritize strict "Past -> Future" flow, so we won't delete based on future completion 
                    // to avoid confusion unless explicitly requested.
                    // Instead, we just focus on ensuring PAST incomplete tasks appear here.
                });

                if (tasksToAdd.length > 0) {
                    const merged = [...currentTasks, ...tasksToAdd];
                    if (JSON.stringify(merged) !== JSON.stringify(currentTasks)) {
                        setTasks(merged);
                        // console.log(`Synced ${tasksToAdd.length} tasks from history.`);
                    }
                }

            } catch (err) {
                console.error("Sync error", err);
            }
        };

        synchronizeHistory();
    }, [dateKey]); // Run whenever we land on a new day

    // -------------------------------------------------------------------------
    // STANDARD HANDLERS
    // -------------------------------------------------------------------------

    const addTask = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTaskText.trim()) return;

        const newTask: Task = {
            id: uuidv4(),
            text: newTaskText,
            completed: false,
            date: dateKey,
            priority: priority
        };

        setTasks([...tasks, newTask]);
        setNewTaskText('');
        setPriority('normal');
        setShowForm(false);
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const getPriorityColor = (p: string) => {
        if (p === 'high') return '#e74c3c';
        if (p === 'low') return '#27ae60';
        return '#95a5a6';
    };

    const renderTaskText = (text: string) => {
        const parts = text.split('(📅 ');
        if (parts.length < 2) return text;
        const mainText = parts[0];
        const datePart = parts[1].replace(')', '');

        return (
            <span>
                {mainText}
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        // Naive parse dd/MM for current year
                        const [day, month] = datePart.split('/').map(Number);
                        const targetDate = new Date();
                        targetDate.setMonth(month - 1);
                        targetDate.setDate(day);
                        if (onGoToDate) onGoToDate(targetDate);
                    }}
                    style={{
                        color: '#3498db', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px',
                        fontSize: '0.85em', background: '#eef2f7', padding: '2px 6px', borderRadius: '4px'
                    }}
                    title="Ir a fecha origen"
                >
                    📅 {datePart}
                </span>
            </span>
        );
    };

    return (
        <div className="task-manager-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                    ✅ Tareas del Día
                </h3>
                <button onClick={() => setShowForm(!showForm)} style={{
                    background: showForm ? '#f1f5f9' : '#3b82f6',
                    color: showForm ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    boxShadow: showForm ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.4)'
                }}>
                    {showForm ? 'Cancelar' : 'Nueva'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={addTask} style={{
                    display: 'flex', gap: '10px', flexWrap: 'wrap',
                    background: 'white', padding: '15px', borderRadius: '16px',
                    border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    animation: 'fadeIn 0.2s'
                }}>
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Escribe el nombre de la tarea..."
                        autoFocus
                        style={{
                            flex: '1 1 100%',
                            padding: '12px 15px',
                            borderRadius: '12px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            fontSize: '1rem',
                            color: '#334155'
                        }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '5px' }}>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            style={{
                                padding: '8px 15px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: getPriorityColor(priority),
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="high">🔴 Alta Prioridad</option>
                            <option value="normal">⚪ Normal</option>
                            <option value="low">🟢 Baja</option>
                        </select>

                        <button type="submit" style={{
                            background: '#1e293b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 25px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.3)'
                        }}>
                            Añadir Tarea
                        </button>
                    </div>
                </form>
            )}

            <div className="task-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', borderRadius: '16px' }}>
                        No hay tareas para hoy. ¡Añade una!
                    </div>
                )}
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="task-item"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '15px',
                            padding: '16px', borderRadius: '16px',
                            background: task.completed ? '#f1f5f9' : 'white',
                            border: task.completed ? '1px solid transparent' : '1px solid #f1f5f9',
                            boxShadow: task.completed ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease',
                            opacity: task.completed ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!task.completed) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!task.completed) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                            }
                        }}
                    >
                        <div onClick={() => toggleTask(task.id)} style={{ cursor: 'pointer', color: task.completed ? '#10b981' : '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                            {task.completed ? <CheckCircle2 size={24} fill="#d1fae5" /> : <Circle size={24} />}
                        </div>

                        <span style={{
                            flex: 1,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#94a3b8' : '#334155',
                            fontWeight: task.completed ? 400 : 500,
                            fontSize: '1.05rem'
                        }}>
                            {renderTaskText(task.text)}
                        </span>

                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px' }}>
                            <Flag size={16} color={getPriorityColor(task.priority)} fill={getPriorityColor(task.priority)} fillOpacity={0.2} />
                        </div>

                        <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '4px' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
