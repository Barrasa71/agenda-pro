import React, { useState } from 'react';
import { useContacts, type Contact } from '../hooks/useContacts';
import { Search, Plus, Phone, Mail, Calendar, Edit2, Trash2, X } from 'lucide-react';

export const ContactsView: React.FC = () => {
    const { contacts, addContact, updateContact, deleteContact } = useContacts();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    // Form State
    const [formData, setFormData] = useState<Omit<Contact, 'id'>>({
        name: '',
        phone: '',
        email: '',
        company: '',
        notes: '',
        birthday: '',
        category: 'other'
    });

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    const handleOpenModal = (contact?: Contact) => {
        if (contact) {
            setEditingContact(contact);
            setFormData({
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                company: contact.company,
                notes: contact.notes,
                birthday: contact.birthday || '',
                category: contact.category
            });
        } else {
            setEditingContact(null);
            setFormData({
                name: '', phone: '', email: '', company: '', notes: '', birthday: '', category: 'other'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        if (editingContact) {
            updateContact(editingContact.id, formData);
        } else {
            addContact(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div style={{ padding: '0 20px 40px 20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Toolbar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px',
                background: 'rgba(255,255,255,0.8)', padding: '15px 25px', borderRadius: '20px',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Buscar contacto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #cbd5e1',
                            outline: 'none', background: '#f8fafc', fontSize: '1rem', color: '#334155'
                        }}
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                        color: 'white', border: 'none', padding: '12px 25px', borderRadius: '15px',
                        fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} /> Nuevo Contacto
                </button>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {filteredContacts.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8', fontStyle: 'italic', fontSize: '1.1rem' }}>
                        No se encontraron contactos.
                    </div>
                )}

                {filteredContacts.map(contact => (
                    <div key={contact.id} className="contact-card" style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '25px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        display: 'flex', flexDirection: 'column', gap: '15px',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)'; }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '15px',
                                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#64748b', fontSize: '20px', fontWeight: 700
                                }}>
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>{contact.name}</h4>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{contact.company || 'Sin Empresa'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => handleOpenModal(contact)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: '#64748b' }}><Edit2 size={16} /></button>
                                <button onClick={() => deleteContact(contact.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: '#ef4444' }}><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: '#f1f5f9' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', color: '#334155' }}>
                            {contact.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} color="#94a3b8" /> {contact.phone}</div>}
                            {contact.email && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} color="#94a3b8" /> <a href={`mailto:${contact.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contact.email}</a></div>}
                            {contact.birthday && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={16} color="#94a3b8" /> {contact.birthday}</div>}
                        </div>

                        {contact.category && (
                            <div style={{ position: 'absolute', top: '25px', right: '-30px', transform: 'rotate(45deg)', background: contact.category === 'vip' ? '#f59e0b' : '#3b82f6', color: 'white', padding: '4px 30px', fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {contact.category.toUpperCase()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '30px',
                        width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>{editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input required placeholder="Nombre Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                                <input placeholder="Empresa / Cargo" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input type="tel" placeholder="Teléfono" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                                <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input type="date" placeholder="Fecha de Nacimiento" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} style={inputStyle} />
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} style={inputStyle}>
                                    <option value="personal">Personal</option>
                                    <option value="work">Trabajo</option>
                                    <option value="vip">VIP</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <textarea placeholder="Notas adicionales..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />

                            <button type="submit" style={{
                                background: '#1e293b', color: 'white', border: 'none', padding: '15px',
                                borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                                marginTop: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                {editingContact ? 'Guardar Cambios' : 'Añadir Contacto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0',
    fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' as 'border-box'
};
