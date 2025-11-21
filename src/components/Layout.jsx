// Layout component for wrapping screens
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ChangeLogModal from './ChangeLogModal';
import HelpModal from './HelpModal';

export default function Layout() {
  const location = useLocation();
  const isProjectsListPage = location.pathname === '/';
  const [showChangelog, setShowChangelog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow">
        <Outlet />
      </main>
      {isProjectsListPage && (
        <footer className="py-2" style={{ background: 'transparent' }}>
          <div className="flex flex-col items-center gap-1">
            <div className="flex justify-center items-center gap-3 w-fit mx-auto">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="text-sm text-gray-600 hover:text-gray-800 transition"
              >
                Help
              </button>

              <button
                type="button"
                onClick={() => setShowChangelog(true)}
                className="text-sm text-gray-600 hover:text-gray-800 transition"
              >
                Change Log
              </button>

              <button
                type="button"
                onClick={() =>
                  window.open('https://github.com/datism/tstiu/issues', '_blank', 'noopener,noreferrer')
                }
                className="text-sm text-red-600 hover:text-red-800 transition"
              >
                Report a Bug
              </button>
            </div>

            <div className="text-xs text-gray-500">Developed by datism</div>
          </div>

          <ChangeLogModal show={showChangelog} onClose={() => setShowChangelog(false)} />
          <HelpModal show={showHelp} onClose={() => setShowHelp(false)} />
        </footer>
      )}
    </div>
  );
}
