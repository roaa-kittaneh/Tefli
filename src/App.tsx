import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { HistoryView } from './pages/HistoryView';
import { FaqView } from './pages/FaqView';
import { ChatbotPage } from './pages/ChatbotPage';
import { HospitalMapPage } from './pages/HospitalMapPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { useVaccineStore } from './store/useVaccineStore';

type AuthScreen = 'login' | 'signup';

function App() {
  const { activeTab, isLoggedIn } = useVaccineStore();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  // ── AUTH GATE ──────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (authScreen === 'signup') {
      return <SignupPage onNavigateToLogin={() => setAuthScreen('login')} />;
    }
    return <LoginPage onNavigateToSignup={() => setAuthScreen('signup')} />;
  }

  // ── MAIN APP ───────────────────────────────────────────────────
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calendar':  return <CalendarView />;
      case 'map':       return <HospitalMapPage />;
      case 'history':   return <HistoryView />;
      case 'faq':       return <FaqView />;
      case 'chatbot':   return <ChatbotPage />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#E6E6E6]">
      <Navigation />
      <main className="flex-1 flex flex-col min-h-0 bg-[#E6E6E6]">
        {renderActivePage()}
      </main>
    </div>
  );
}

export default App;
