import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AppLayout = ({ children, title, subtitle, actions }) => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4 overflow-auto" style={{ maxWidth: 'calc(100vw - 240px)' }}>
          {(title || actions) && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                {title && <h2 className="h4 fw-bold text-dark mb-1">{title}</h2>}
                {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
              </div>
              {actions && <div className="mt-2 mt-sm-0">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
