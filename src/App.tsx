import { useState } from 'react';
import './App.css';
import { LayoutDashboard, Calendar, Users, Settings, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DailyLog } from './components/DailyLog';
import { TaskManager } from './components/TaskManager';
import { RemindersManager } from './components/RemindersManager';
import { CalendarView } from './components/CalendarView';
import { ContactsView } from './components/ContactsView';
import { PasswordsView } from './components/PasswordsView';

function App() {
  const [activeTab, setActiveTab] = useState('agenda');
  const [currentDate, setCurrentDate] = useState(new Date());

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const displayDate = format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="app-container">
      {/* Sidebar with Glassmorphism */}
      <aside className="sidebar">
        <div className="sidebar-header">

          <span className="app-title">Agenda Personal</span>
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

          <button
            className={`nav-item ${activeTab === 'passwords' ? 'active' : ''}`}
            onClick={() => setActiveTab('passwords')}
          >
            <Lock size={20} />
            <span>Contraseñas</span>
          </button>
        </nav>

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img
            src="shield_final.png?v=full_width"
            alt="Agenda Personal"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 70%)',
              maskImage: 'radial-gradient(circle at center, black 65%, transparent 70%)',
              marginBottom: '10px'
            }}
          />
          <button className="nav-item">
            <Settings size={20} />
            <span>Configuración</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Left PlaceHolder to balance center */}
            <div style={{ width: '100px' }}></div>

            {/* Center: Date & Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {activeTab === 'agenda' && (
                <button onClick={prevDay} className="icon-btn-small" style={{ WebkitAppRegion: 'no-drag' } as any}><ChevronLeft size={24} /></button>
              )}

              <h1 style={{ textTransform: 'capitalize', margin: 0, fontSize: '1.8rem', textAlign: 'center' }}>
                {activeTab === 'agenda' ? displayDate :
                  activeTab === 'calendar' ? 'Calendario Mensual' :
                    activeTab === 'contacts' ? 'Agenda de Contactos' :
                      'Bóveda de Contraseñas'}
              </h1>

              {activeTab === 'agenda' && (
                <button onClick={nextDay} className="icon-btn-small" style={{ WebkitAppRegion: 'no-drag' } as any}><ChevronRight size={24} /></button>
              )}
            </div>

            {/* Right: Actions */}
            <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {activeTab === 'agenda' && (
                <button onClick={goToday} className="text-btn-small" style={{
                  fontSize: '1rem', background: 'rgba(0,0,0,0.05)', padding: '6px 15px', borderRadius: '20px', WebkitAppRegion: 'no-drag'
                } as any}>
                  Hoy
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="content-scroll">
          {activeTab === 'agenda' && (
            <div className="unified-agenda-container" style={{
              position: 'relative',
              background: `
                  linear-gradient(90deg, transparent 55px, #ff9999 55px, #ff9999 57px, transparent 57px),
                  repeating-linear-gradient(transparent, transparent 29px, #a3c2c2 29px, #a3c2c2 30px)
              `,
              backgroundColor: '#fffcf5',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              borderRadius: '2px 12px 12px 2px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              overflowY: 'auto',
              margin: '0',
              padding: '0'
            }}>
              {/* Notebook Holes */}
              <div style={{
                position: 'absolute', left: '15px', top: '0', bottom: '0',
                width: '40px', pointerEvents: 'none', zIndex: 50,
                display: 'flex', flexDirection: 'column', gap: '29px', paddingTop: '45px', alignItems: 'center'
              }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#444', opacity: 0.15, boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)' }}></div>
                ))}
              </div>

              <div style={{ padding: '29px 40px 40px 70px' }}>
                <div style={{ minHeight: '300px' }}>
                  <DailyLog dateKey={dateKey} />
                </div>
                <div style={{ height: '2px', background: '#333', opacity: 0.1, margin: '20px 0', borderRadius: '50%' }} />
                <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', borderRadius: '16px', padding: '15px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <RemindersManager dateKey={dateKey} />
                </div>
                <div style={{ height: '2px', background: '#333', opacity: 0.1, margin: '20px 0', borderRadius: '50%' }} />
                <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', borderRadius: '16px', padding: '15px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <TaskManager dateKey={dateKey} onGoToDate={setCurrentDate} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'calendar' && (
            <CalendarView onGoToDate={(date) => {
              setCurrentDate(date);
              setActiveTab('agenda');
            }} />
          )
          }
          {activeTab === 'contacts' && <ContactsView />}
          {activeTab === 'passwords' && <PasswordsView />}
        </div >
      </main >
    </div >
  );
}

export default App;
