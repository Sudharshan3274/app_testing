import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { auth } = await import('../firebase.js');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // We no longer strictly need to manage our own localStorage for tokens,
      // but keeping it helps backwards compatibility with existing UI hooks temporarily
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', userCredential.user.email);
      localStorage.setItem('userFullName', userCredential.user.displayName || 'User');
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { auth } = await import('../firebase.js');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('A password reset link has been sent to your email address.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '450px',
        padding: '3rem 2rem',
        animation: 'fadeIn 0.5s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '150px',
          background: 'var(--accent-primary)',
          filter: 'blur(100px)',
          opacity: 0.5,
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', padding: '0.4rem 0', marginBottom: '1.5rem',
              fontSize: '0.9rem', fontFamily: 'inherit', transition: 'color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div style={{ textAlign: 'center' }}>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', marginTop: 0 }}>
              {isResetMode ? 'Reset Password' : 'Welcome Back'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isResetMode ? 'Enter your email to receive a password reset link.' : 'Log in to access your AI interview dashboard.'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#f87171',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#4ade80',
            fontSize: '0.9rem',
          }}>
            {successMessage}
          </div>
        )}

        {isResetMode ? (
          <form onSubmit={handleResetPassword} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => { setIsResetMode(false); setError(''); setSuccessMessage(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                textAlign: 'center',
                marginTop: '0.5rem',
                outline: 'none'
              }}
            >
              Back to Log In
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setIsResetMode(true); setError(''); setSuccessMessage(''); }}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        <p style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign up</Link>
        </p>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
