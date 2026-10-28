import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <div className="container text-center text-muted small">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} StaffSync — Modern Human Resource Management Solution (MERN)
        </p>
      </div>
    </footer>
  );
};

export default Footer;
