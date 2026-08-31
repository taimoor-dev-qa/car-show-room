import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', businessName: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await API.post('/auth/signup', form);
            login(res.data.user, res.data.token);
            navigate(form.role === 'seller' ? '/seller/dashboard' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '80px auto', padding: 20 }}>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }} />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }} />
                <select name="role" onChange={handleChange} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                </select>
                {form.role === 'seller' && (
                    <input name="businessName" placeholder="Business Name" onChange={handleChange}
                        style={{ width: '100%', padding: 10, marginBottom: 10 }} />
                )}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: 10 }}>Signup</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}