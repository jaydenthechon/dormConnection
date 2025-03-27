import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const LoginPage = ({ onLoginSubmit }) => {
  const [loginData, setLoginData] = useState({ email: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email.endsWith('@bu.edu')) {
      alert('Please use a valid @bu.edu email');
      return;
    }
    const success = await onLoginSubmit(loginData);
    if (success) {
      login();
      navigate('/');
    } else {
      // Handle login failure
      console.log('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={loginData.email} onChange={handleChange} placeholder="Email" required />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
