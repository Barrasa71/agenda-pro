import React, { useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Save } from 'lucide-react';

interface DailyLogProps {
    dateKey: string; // YYYY-MM-DD
}

export const DailyLog: React.FC<DailyLogProps> = ({ dateKey }) => {
    // Key depends on date, so switching days switches content automatically
    const [content, setContent] = useLocalStorage<string>(`agenda_log_${dateKey}`, '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (

        <div className="daily-log-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            height: '100%',
            minHeight: '400px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                    📝 Diario de Trabajo
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
                    <Save size={14} /> Guardado automático
                </span>
            </div>

            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué has hecho hoy? Escribe tus notas, reuniones o ideas aquí (soporta Markdown básico)..."
                style={{
                    width: '100%',
                    flex: 1,
                    border: 'none',
                    padding: '0',
                    fontSize: '1.2rem',
                    fontFamily: '"Caveat", "Indie Flower", "Patrick Hand", cursive, sans-serif', // Handwritten style
                    lineHeight: '30px', // Matches line height of parent
                    background: 'transparent',
                    color: '#2c3e50',
                    resize: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                }}
            />
            {/* Holes removed from here as they are now global */}
        </div>
    );
};
