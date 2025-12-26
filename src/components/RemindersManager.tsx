import React, { useState } from 'react';
import { useReminders } from '../hooks/useReminders';
import { Trash2, Calendar, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RemindersManagerProps {
    dateKey: string;
}

export const RemindersManager: React.FC<RemindersManagerProps> = ({ dateKey }) => {
    const { reminders, addReminder, deleteReminder, activeAlerts } = useReminders(dateKey);
    const [newItem, setNewItem] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showList, setShowList] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem || !targetDate) return;
        addReminder(newItem, targetDate);
        setNewItem('');
        setTargetDate('');
        setShowForm(false);
    };

    return (
        <div className="reminders-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#8e44ad', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                    🔔 Recordatorios
                </h3>
                <button onClick={() => setShowForm(!showForm)} style={{
                    background: showForm ? '#f1f5f9' : '#8e44ad',
                    color: showForm ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    boxShadow: showForm ? 'none' : '0 4px 6px -1px rgba(142, 68, 173, 0.4)'
                }}>
                    {showForm ? 'Cancelar' : 'Nuevo'}
                </button>
            </div>

            {/* Active Alerts (The Countdown) */}
            {activeAlerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeAlerts.map(({ reminder, daysLeft, urgency }) => (
                        <div key={reminder.id} style={{
                            background: urgency === 'high' ? '#fff1f2' : urgency === 'medium' ? '#fff7ed' : '#eff6ff',
                            borderLeft: `4px solid ${urgency === 'high' ? '#e11d48' : urgency === 'medium' ? '#f97316' : '#3b82f6'}`,
                            padding: '12px 16px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '15px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                        }}>
                            <AlertCircle size={20} color={urgency === 'high' ? '#e11d48' : urgency === 'medium' ? '#f97316' : '#3b82f6'} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{reminder.text}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                                    {daysLeft === 0 ? <span style={{ color: '#e11d48', fontWeight: 'bold' }}>¡HOY es el día!</span> : `Faltan ${daysLeft} días`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Form */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s' }}>
                    <input
                        type="text"
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder="Título del evento (ej. Reunión Anual)"
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                        />
                        <button type="submit" style={{ background: '#8e44ad', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', fontWeight: 600 }}>
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            {/* List of All Defined Reminders */}
            <div style={{ marginTop: '10px' }}>
                <div
                    onClick={() => setShowList(!showList)}
                    style={{
                        fontSize: '0.9rem', color: '#64748b', marginBottom: '12px',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                        userSelect: 'none', fontWeight: 500
                    }}
                >
                    {showList ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>Próximos Eventos ({reminders.length})</span>
                </div>

                {showList && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                        {reminders.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No hay recordatorios configurados.</span>}
                        {reminders.sort((a, b) => parseISO(a.targetDate).getTime() - parseISO(b.targetDate).getTime()).map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                <div style={{ background: '#f5f3ff', padding: '6px', borderRadius: '6px' }}>
                                    <Calendar size={14} color="#8b5cf6" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>{r.text}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {format(parseISO(r.targetDate), "d 'de' MMMM", { locale: es })}
                                    </span>
                                </div>
                                <button onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '4px' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
