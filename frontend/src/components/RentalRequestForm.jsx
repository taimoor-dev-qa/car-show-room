import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const dateValue = (date) => new Date(date).toISOString().slice(0, 10);
const dayCount = (start, end) => Math.ceil((new Date(end) - new Date(start)) / 86400000);
const purposes = ['Personal', 'Business', 'Wedding', 'Trip/Vacation', 'Other'];

export default function RentalRequestForm({ rental }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startDate: '', endDate: '', driverRequested: false, pickupNotes: '', passengerCount: 1,
    pickupAddress: '', returnSameAsPickup: true, returnAddress: '', contactPhone: '',
    contactName: user?.name || '', cnicNumber: '', rentalPurpose: '', estimatedDistance: '',
    depositAcknowledged: false, paymentMethod: '', termsAccepted: false, licenseConfirmed: false,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const totalDays = form.startDate && form.endDate ? dayCount(form.startDate, form.endDate) : 0;
  const dailyRate = rental.dailyRate + (form.driverRequested ? (rental.driverCharges || 0) : 0);
  const estimatedTotal = totalDays > 0 ? totalDays * dailyRate : 0;
  const canSubmit = form.depositAcknowledged && form.termsAccepted
    && (form.driverRequested || form.licenseConfirmed);

  const change = (event) => {
    const { name, value, checked, type } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');
    setError('');
    try {
      await API.post('/rental-requests', { rentalCarId: rental._id, ...form });
      setMessage('Rental request sent. Redirecting to My Rentals...');
      setTimeout(() => navigate('/my-rentals'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send rental request.');
    }
  };

  return <section className="rental-request-card"><h3>Request to Rent</h3><p>Complete your details and send a request to the rental provider.</p><form className="rental-request-form" onSubmit={submit}>
    <Field label="Start Date" name="startDate" type="date" value={form.startDate} change={change} min={dateValue(rental.availableFrom)} max={dateValue(rental.availableUntil)} required />
    <Field label="End Date" name="endDate" type="date" value={form.endDate} change={change} min={form.startDate || dateValue(rental.availableFrom)} max={dateValue(rental.availableUntil)} required />
    <Field label="Passenger Count" name="passengerCount" type="number" value={form.passengerCount} change={change} min="1" required />
    <Field label="Pickup Address" name="pickupAddress" value={form.pickupAddress} change={change} required />
    <label className="rental-check"><input name="returnSameAsPickup" type="checkbox" checked={form.returnSameAsPickup} onChange={change} /> Return to the same pickup address</label>
    {!form.returnSameAsPickup && <Field label="Return Address" name="returnAddress" value={form.returnAddress} change={change} />}
    {rental.driverAvailable && <label className="rental-check"><input name="driverRequested" type="checkbox" checked={form.driverRequested} onChange={change} /> Request a driver{rental.driverCharges ? ` (PKR ${rental.driverCharges.toLocaleString()}/day)` : ''}</label>}
    {!form.driverRequested && <label className="rental-check"><input name="licenseConfirmed" type="checkbox" checked={form.licenseConfirmed} onChange={change} /> I confirm I have a valid driving license</label>}
    <Field label="Contact Phone" name="contactPhone" type="tel" value={form.contactPhone} change={change} required />
    <Field label="Contact Name" name="contactName" value={form.contactName} change={change} />
    <Field label="CNIC Number" name="cnicNumber" value={form.cnicNumber} change={change} placeholder="XXXXX-XXXXXXX-X" required />
    <Select label="Rental Purpose" name="rentalPurpose" value={form.rentalPurpose} change={change} options={purposes} />
    <Field label="Estimated Distance (km, optional)" name="estimatedDistance" type="number" value={form.estimatedDistance} change={change} min="0" />
    <Select label="Payment Method" name="paymentMethod" value={form.paymentMethod} change={change} options={['Cash', 'Bank Transfer']} />
    <label className="rental-notes">Pickup Notes<textarea name="pickupNotes" rows="3" value={form.pickupNotes} onChange={change} placeholder="Any pickup preferences?" /></label>
    <label className="rental-check"><input name="depositAcknowledged" type="checkbox" checked={form.depositAcknowledged} onChange={change} /> I agree to pay a refundable security deposit upon pickup</label>
    <label className="rental-check"><input name="termsAccepted" type="checkbox" checked={form.termsAccepted} onChange={change} /> I agree to the rental terms and conditions</label>
    <div className="rental-estimate"><span>{totalDays > 0 ? `${totalDays} day${totalDays === 1 ? '' : 's'}` : 'Select dates'}</span><strong>{estimatedTotal ? `Estimated: PKR ${estimatedTotal.toLocaleString()}` : 'Estimated total will appear here'}</strong></div>
    {error && <p className="rental-error">{error}</p>}{message && <p className="rental-success">{message}</p>}<button className="submit-btn" disabled={!canSubmit}>Request to Rent</button>
  </form></section>;
}

function Field({ label, name, type = 'text', value, change, required, ...props }) { return <label>{label}<input name={name} type={type} value={value} onChange={change} required={required} {...props} /></label>; }
function Select({ label, name, value, change, options }) { return <label>{label}<select name={name} value={value} onChange={change} required><option value="">Select {label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
