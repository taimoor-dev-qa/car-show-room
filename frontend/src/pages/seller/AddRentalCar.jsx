import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/seller-style.css';
import '../../styles/10-rental.css';

const initialForm = () => {
  const availableFrom = new Date();
  const availableUntil = new Date(availableFrom);
  availableUntil.setMonth(availableUntil.getMonth() + 2);
  return {
    makeModel: '', variant: '', year: '', category: '', transmission: '', fuelType: '',
    seats: '', mileage: '', description: '', dailyRate: 2000, city: 'Lahore',
    pickupArea: 'To be confirmed', availableFrom: dateValue(availableFrom),
    availableUntil: dateValue(availableUntil), driverAvailable: false, driverCharges: '',
    minRentalDays: 1, maxRentalDays: 30, status: 'draft',
  };
};

const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';

export default function AddRentalCar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'seller') return navigate('/seller/login');
    if (editId) API.get(`/rentals/${editId}`).then(({ data }) => {
      setForm({ ...initialForm(), ...data, availableFrom: dateValue(data.availableFrom), availableUntil: dateValue(data.availableUntil) });
    }).catch(() => setError('Unable to load rental listing.'));
  }, [editId, navigate, user]);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = new FormData();
      const payload = editId ? form : {
        ...form, dailyRate: 2000, city: 'Lahore', pickupArea: 'To be confirmed',
        driverAvailable: false, driverCharges: 0, minRentalDays: 1, maxRentalDays: 30,
      };
      Object.entries(payload).forEach(([key, value]) => data.append(key, value));
      images.forEach((image) => data.append('images', image));
      if (editId) await API.put(`/rentals/${editId}`, data);
      else await API.post('/rentals', data);
      navigate('/seller/rental-cars');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save rental listing.');
    }
  };

  return <div className="app-layout">
    <aside className="sidebar"><div className="sidebar-brand"><div className="brand-icon">🚗</div><div className="brand-text"><h2>Car<span>Zone</span></h2><span>Seller Panel</span></div></div>
      <div className="sidebar-section-title">MAIN MENU</div><nav className="nav-menu"><Link to="/seller/dashboard" className="nav-item">Dashboard</Link><Link to="/seller/rental-cars" className="nav-item active">Rental Cars</Link><Link to="/seller/inquiries" className="nav-item">Inquiries</Link><Link to="/seller/chat" className="nav-item">Messages</Link></nav>
      <div className="sidebar-footer"><Link to="/" className="back-to-site">← Back to CarZone</Link><button onClick={logout} className="rental-logout">Logout</button></div>
    </aside>
    <main className="main-content"><header className="top-header"><div className="page-heading"><span className="page-eyebrow">RENTAL CARS</span><h1>{editId ? 'Edit Rental Car' : 'Add Rental Car'}</h1><p>Create a separate rental listing for your fleet.</p></div></header>
      <div className="rental-form-card content-card"><form className="rental-form" onSubmit={submit}>
        <div className="rental-form-grid">
          <Field label="Make & Model" name="makeModel" form={form} change={change} required />{editId && <Field label="Variant" name="variant" form={form} change={change} />}
          <Field label="Year" name="year" type="number" form={form} change={change} required /><Select label="Category" name="category" form={form} change={change} options={['Sedan', 'SUV', 'Hatchback', 'Electric', 'Luxury', 'Pickup Truck']} />
          <Select label="Transmission" name="transmission" form={form} change={change} options={['Automatic', 'Manual']} /><Select label="Fuel Type" name="fuelType" form={form} change={change} options={['Petrol', 'Diesel', 'Hybrid', 'Electric']} />
          <Field label="Seats" name="seats" type="number" form={form} change={change} required /><Field label="Mileage (km)" name="mileage" type="number" form={form} change={change} required />
          {editId && <><Field label="Daily Rate (PKR)" name="dailyRate" type="number" form={form} change={change} required /><Field label="City" name="city" form={form} change={change} required />
          <Field label="Pickup Area" name="pickupArea" form={form} change={change} required /><Field label="Available From" name="availableFrom" type="date" form={form} change={change} required />
          <Field label="Available Until" name="availableUntil" type="date" form={form} change={change} required /><Field label="Minimum Rental Days" name="minRentalDays" type="number" form={form} change={change} required />
          <Field label="Maximum Rental Days" name="maxRentalDays" type="number" form={form} change={change} required /></>}
          <Select label="Status" name="status" form={form} change={change} options={['draft', 'active', 'reserved', 'rented', 'unavailable', 'archived']} />
        </div>
        {editId && <><label className="rental-check"><input type="checkbox" name="driverAvailable" checked={form.driverAvailable} onChange={change} /> Driver available</label>
        {form.driverAvailable && <Field label="Driver Charges (PKR/day)" name="driverCharges" type="number" form={form} change={change} />}</>}
        <div className="form-group"><label>Description</label><textarea name="description" rows="4" value={form.description} onChange={change} /></div>
        <div className="form-group"><label>Rental Images (up to 10)</label><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setImages(Array.from(e.target.files).slice(0, 10))} /></div>
        {error && <p className="rental-error">{error}</p>}<button className="submit-btn">{editId ? 'Save Changes' : 'Create Rental Listing'}</button>
      </form></div>
    </main>
  </div>;
}

function Field({ label, name, type = 'text', form, change, required }) { return <div className="form-group"><label>{label}</label><input name={name} type={type} value={form[name]} onChange={change} required={required} /></div>; }
function Select({ label, name, form, change, options }) { return <div className="form-group"><label>{label}</label><select name={name} value={form[name]} onChange={change} required><option value="">Select {label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>; }
