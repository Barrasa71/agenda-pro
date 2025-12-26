import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, FileText, Bell } from 'lucide-react';

interface CalendarViewProps {
    onGoToDate: (date: Date) => void;
}

interface DayData {
    hasLog: boolean;
    hasPendingTasks: boolean;
    hasReminder: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onGoToDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthData, setMonthData] = useState<Map<string, DayData>>(new Map());

    // Generate days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    // Chunk days into weeks for Table Rows
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    calendarDays.forEach((day, index) => {
        currentWeek.push(day);
        if ((index + 1) % 7 === 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    // Scan data
    useEffect(() => {
        const newData = new Map<string, DayData>();
        const remindersRaw = window.localStorage.getItem('agenda_reminders_all');
        const allReminders = remindersRaw ? JSON.parse(remindersRaw) : [];

        calendarDays.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            let data: DayData = { hasLog: false, hasPendingTasks: false, hasReminder: false };

            if (window.localStorage.getItem(`agenda_log_${dateKey}`)) data.hasLog = true;

            const tasksRaw = window.localStorage.getItem(`agenda_tasks_${dateKey}`);
            if (tasksRaw) {
                const tasks = JSON.parse(tasksRaw);
                if (tasks.some((t: any) => !t.completed)) data.hasPendingTasks = true;
            }

            if (allReminders.some((r: any) => r.targetDate === dateKey)) data.hasReminder = true;

            newData.set(dateKey, data);
        });
        setMonthData(newData);
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)', // Slightly translucent
            backdropFilter: 'blur(10px)',
            borderRadius: '24px', // Softer corners
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08), 0 5px 15px rgba(0,0,0,0.05)', // Deep premium shadow
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.8)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, textTransform: 'capitalize', color: '#1e293b', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: '"Outfit", sans-serif' }}>
                        {format(currentMonth, 'MMMM', { locale: es })}
                    </h2>
                    <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500 }}>{format(currentMonth, 'yyyy')}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                    <button onClick={prevMonth} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <ChevronLeft size={20} color="#334155" />
                    </button>
                    <button onClick={nextMonth} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <ChevronRight size={20} color="#334155" />
                    </button>
                </div>
            </div>

            {/* Table Layout */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <table style={{
                    width: '100%',
                    height: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '12px',  // More breathing room
                    tableLayout: 'fixed'
                }}>
                    <thead>
                        <tr style={{ height: '40px' }}>
                            {weekDays.map(d => (
                                <th key={d} style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '10px', fontWeight: 700 }}>
                                    {d.substring(0, 3)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week, wIndex) => (
                            <tr key={wIndex}>
                                {week.map(day => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const isToday = isSameDay(day, new Date());
                                    const data = monthData.get(dateKey);

                                    return (
                                        <td
                                            key={day.toISOString()}
                                            onClick={() => onGoToDate(day)}
                                            style={{
                                                background: isToday ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : isCurrentMonth ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                                borderRadius: '16px',
                                                cursor: 'pointer',
                                                verticalAlign: 'top',
                                                padding: '12px',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                border: isToday ? 'none' : '1px solid #f1f5f9',
                                                boxShadow: isToday ? '0 10px 25px rgba(37, 99, 235, 0.3)' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isToday && isCurrentMonth) {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)';
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.zIndex = '10';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isToday && isCurrentMonth) {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                                    e.currentTarget.style.zIndex = '1';
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <span style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: isToday ? 700 : 600,
                                                        color: isToday ? '#fff' : isCurrentMonth ? '#334155' : '#cbd5e1',
                                                        fontFamily: '"Outfit", sans-serif'
                                                    }}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {data?.hasLog && (
                                                        <div style={{ background: isToday ? 'rgba(255,255,255,0.2)' : '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
                                                            <FileText size={12} color={isToday ? '#fff' : '#64748b'} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {data?.hasReminder && (
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            background: isToday ? 'rgba(255,255,255,0.2)' : '#fff7ed',
                                                            padding: '2px 6px', borderRadius: '10px',
                                                            border: isToday ? 'none' : '1px solid #ffedd5'
                                                        }}>
                                                            <Bell size={10} color={isToday ? '#fff' : '#f97316'} fill={isToday ? '#fff' : '#f97316'} />
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isToday ? '#fff' : '#c2410c' }}>Aviso</span>
                                                        </div>
                                                    )}
                                                    {data?.hasPendingTasks && (
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isToday ? '#fff' : '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Premium Legend */}
            <div style={{ display: 'flex', gap: '30px', padding: '15px 10px 0', borderTop: '1px solid rgba(0,0,0,0.04)', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#fff7ed', padding: '4px', borderRadius: '6px', border: '1px solid #ffedd5' }}>
                        <Bell size={12} color="#f97316" fill="#f97316" />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Aviso Pendiente</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Tareas sin terminar</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
                        <FileText size={12} color="#64748b" />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Diario escrito</span>
                </div>
            </div>
        </div>
    );
};
