
import React from 'react';
import type { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
}> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? 'bg-primary-600 text-white shadow-md'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="sticky top-0 z-40 bg-gray-900/30 backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="https://i.imgur.com/P1sN6nh.png" alt="Logo" className="w-8 h-8 mr-3"/>
            <h1 className="text-xl font-bold text-white">Gerenciador</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <NavButton
              label="Especializações"
              isActive={activeView === 'specializations'}
              onClick={() => setActiveView('specializations')}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>}
            />
            <NavButton
              label="Licenças"
              isActive={activeView === 'licenses'}
              onClick={() => setActiveView('licenses')}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
             <NavButton
              label="Backup"
              isActive={activeView === 'backup'}
              onClick={() => setActiveView('backup')}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>}
            />
             <NavButton
                label="Manual"
                isActive={activeView === 'manual'}
                onClick={() => setActiveView('manual')}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
              />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
