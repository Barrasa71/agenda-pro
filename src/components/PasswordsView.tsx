import React, { useState } from 'react';
import { usePasswords, type PasswordEntry } from '../hooks/usePasswords';
import { Search, Plus, Eye, EyeOff, Copy, Trash2, Edit2, Lock, X, Globe, User } from 'lucide-react';

export const PasswordsView: React.FC = () => {
    const { passwords, addPassword, deletePassword, updatePassword } = usePasswords();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<PasswordEntry>>({
        site: '', username: '', password: '', category: 'Personal'
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter
    const filtered = passwords.filter(p =>
        p.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.site || !formData.password) return;

        if (editingId) {
            updatePassword(editingId, formData);
        } else {
            addPassword(formData as any);
        }
        closeModal();
    };

    const openEdit = (p: PasswordEntry) => {
        setFormData(p);
        setEditingId(p.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ site: '', username: '', password: '', category: 'Personal' });
        setEditingId(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could accept a toast function here
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Lock size={32} color="#f59e0b" />
                        Bóveda de Contraseñas
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Gestiona tus accesos de forma segura</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px',
                        padding: '12px 25px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                >
                    <Plus size={20} /> Añadir Contraseña
                </button>
            </div>

            {/* Toolbar */}
            <div style={{ marginBottom: '30px', position: 'relative' }}>
                <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder="Buscar por sitio web o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', padding: '15px 15px 15px 45px', borderRadius: '16px',
                        border: '1px solid #e2e8f0', fontSize: '1rem', background: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)', outline: 'none'
                    }}
                />
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto', paddingBottom: '20px' }}>
                {filtered.map(p => (
                    <PasswordCard key={p.id} entry={p} onEdit={() => openEdit(p)} onDelete={() => deletePassword(p.id)} onCopy={copyToClipboard} />
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <form onSubmit={handleSave} style={{
                        background: 'white', padding: '30px', borderRadius: '24px', width: '450px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editingId ? 'Editar Acceso' : 'Nuevo Acceso'}</h3>
                            <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569' }}>Sitio Web / App</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                    <input required autoFocus className="modal-input" placeholder="ej. Netflix, Gmail..." value={formData.site} onChange={e => setFormData({ ...formData, site: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569' }}>Usuario / Email</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                    <input className="modal-input" placeholder="nombre@email.com" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569' }}>Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                    <input required type="text" className="modal-input" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569' }}>Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} style={inputStyle}>
                                    <option value="Personal">Personal</option>
                                    <option value="Work">Trabajo</option>
                                    <option value="Social">Social</option>
                                    <option value="Finance">Finanzas</option>
                                    <option value="Other">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: 1, background: '#1e293b', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

// Sub-component for individual card with reveal logic
const PasswordCard: React.FC<{ entry: PasswordEntry; onEdit: () => void; onDelete: () => void; onCopy: (t: string) => void }> = ({ entry, onEdit, onDelete, onCopy }) => {
    const [revealed, setRevealed] = useState(false);

    return (
        <div style={{
            background: 'white', borderRadius: '20px', padding: '20px',
            border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden',
            transition: 'transform 0.2s'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#d97706' }}>
                        {entry.site.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{entry.site}</h4>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{entry.category}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={onEdit} className="icon-btn-small"><Edit2 size={16} /></button>
                    <button onClick={onDelete} className="icon-btn-small" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{entry.username}</div>
                    <button onClick={() => onCopy(entry.username)} title="Copiar Usuario" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><Copy size={14} /></button>
                </div>
                <div style={{ height: '1px', background: '#e2e8f0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#334155', letterSpacing: revealed ? '0' : '2px' }}>
                        {revealed ? entry.password : '••••••••'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setRevealed(!revealed)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => onCopy(entry.password)} title="Copiar Contraseña" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><Copy size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
    border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none'
};
