import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SplashScreen } from './components/SplashScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { getCurrentUser } from './lib/auth';

type AppStage = 'splash' | 'login' | 'loading' | 'logout' | 'dashboard';

function App() {
  const [stage, setStage] = useState<AppStage>('splash');

  useEffect(() => {
    if (stage !== 'splash') return;

    const splashTimer = setTimeout(() => {
      const user = getCurrentUser();
      setStage(user ? 'loading' : 'login');
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'loading') return;
    const loadingTimer = setTimeout(() => {
      setStage('dashboard');
    }, 1000);
    return () => clearTimeout(loadingTimer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'logout') return;
    const logoutTimer = setTimeout(() => {
      setStage('login');
    }, 1000);
    return () => clearTimeout(logoutTimer);
  }, [stage]);

  const handleLogin = () => {
    setStage('loading');
  };

  const handleLogout = () => {
    setStage('logout');
  };

  if (stage === 'splash') return <SplashScreen />;
  if (stage === 'login') return <LoginPage onLogin={handleLogin} />;
  if (stage === 'loading' || stage === 'logout') return <LoadingScreen type={stage} />;

  return <Dashboard onLogout={handleLogout} />;
}

export default App;