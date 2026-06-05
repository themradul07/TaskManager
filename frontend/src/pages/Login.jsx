import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      showToast('success', 'Logged in successfully! Welcome back.');
      navigate('/');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Invalid email or password. Please try again.');
      showToast('error', err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              background: 'var(--primary-gradient)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              color: 'white',
              marginBottom: '16px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
            }}
          >
            <CheckSquare size={32} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Welcome to <span className="gradient-text">Taskmaster</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sleek & powerful task management system
          </p>
        </div>

        {submitError && (
          <div 
            style={{ 
              background: 'var(--danger-light)', 
              color: 'var(--danger)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '20px',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                }}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
              />
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: formErrors.email ? 'var(--danger)' : 'var(--text-muted)'
                }} 
              />
            </div>
            {formErrors.email && (
              <span className="form-error-msg">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className={`form-input ${formErrors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
                }}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
              />
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: formErrors.password ? 'var(--danger)' : 'var(--text-muted)'
                }} 
              />
            </div>
            {formErrors.password && (
              <span className="form-error-msg">{formErrors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ 
              color: 'var(--primary)', 
              textDecoration: 'none', 
              fontWeight: '600',
              transition: 'color var(--transition-fast)'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--primary-hover)'}
            onMouseOut={(e) => e.target.style.color = 'var(--primary)'}
          >
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
