import { useState } from 'react';
import './App.css';
import { LayoutDashboard, Calendar, Users, Settings, PlusCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('agenda');

  return (
    <div className="app-container">
      {/* Sidebar with Glassmorphism */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-icon">📓</div>
          <h2>Agenda Pro</h2>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <LayoutDashboard size={20} />
            <span>Agenda Diaria</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={20} />
            <span>Planificación</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={20} />
            <span>Contactos</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={20} />
            <span>Configuración</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <h1>
            {activeTab === 'agenda' && '🌞 Mi Día'}
            {activeTab === 'calendar' && '📅 Calendario Mensual'}
            {activeTab === 'contacts' && '👥 Agenda de Contactos'}
          </h1>
          <div className="actions">
            <button className="icon-btn" title="Añadir Rápido"><PlusCircle size={22} /></button>
          </div>
        </header>

        <div className="content-scroll">
          {activeTab === 'agenda' && (
            <div className="placeholder-view">
              <h3>Aquí irá tu Agenda Diaria</h3>
              <p>Tareas, Notas y Log de trabajo...</p>
            </div>
          )}
          {activeTab === 'calendar' && <div className="placeholder-view">Vista de Calendario (Próximamente)</div>}
          {activeTab === 'contacts' && <div className="placeholder-view">Gestión de Contactos (Próximamente)</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
