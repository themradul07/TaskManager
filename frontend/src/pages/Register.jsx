import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
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

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await register(name, email, password);
      showToast('success', 'Account created successfully! Welcome to Taskmaster.');
      navigate('/');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Registration failed. Please try again.');
      showToast('error', err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="glass-panel" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            <CheckSquare size={30} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Get started with your free Taskmaster profile
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
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                type="text"
                className={`form-input ${formErrors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                }}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
              />
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: formErrors.name ? 'var(--danger)' : 'var(--text-muted)'
                }} 
              />
            </div>
            {formErrors.name && (
              <span className="form-error-msg">{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="john@example.com"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm"
                  type="password"
                  className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
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
                    color: formErrors.confirmPassword ? 'var(--danger)' : 'var(--text-muted)'
                  }} 
                />
              </div>
              {formErrors.confirmPassword && (
                <span className="form-error-msg">{formErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px', marginTop: '12px', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--primary)', 
              textDecoration: 'none', 
              fontWeight: '600',
              transition: 'color var(--transition-fast)'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--primary-hover)'}
            onMouseOut={(e) => e.target.style.color = 'var(--primary)'}
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
