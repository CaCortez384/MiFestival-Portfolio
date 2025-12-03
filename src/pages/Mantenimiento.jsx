import React from 'react';

export default function Mantenimiento() {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    textAlign: 'center',
    padding: '2rem',
  };

  const cardStyle = {
    maxWidth: 640,
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  };

  const logoStyle = {
    width: 64,
    height: 64,
    marginBottom: '1rem',
    opacity: 0.9
  };

  const h1Style = { fontSize: '1.75rem', marginBottom: '0.5rem' };
  const pStyle = { fontSize: '1rem', lineHeight: 1.6, opacity: 0.9 };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src="/mflogo20.png" alt="MiFestival" style={logoStyle} />
        <h1 style={h1Style}>Estamos haciendo mantenimiento</h1>
        <p style={pStyle}>
          Nuestra app está temporalmente en mantenimiento para mejorar tu experiencia.
          Vuelve a intentarlo más tarde. Gracias por tu paciencia.
        </p>
      </div>
    </div>
  );
}
