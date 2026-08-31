import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await API.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);

            if (res.data.user.role === 'seller') {
                navigate('/seller/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '80px auto', padding: 20 }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }} />
                <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }} />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: 10 }}>Login</button>
            </form>
            <p>New here? <Link to="/signup">Signup</Link></p>
        </div>
    );
}