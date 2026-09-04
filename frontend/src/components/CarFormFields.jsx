const categories = ['Sedan', 'SUV', 'Hatchback', 'Electric', 'Luxury', 'Pickup Truck'];

export default function CarFormFields({ form, change }) {
  return <><section className="car-form-section"><h3>Listing Basics</h3><div className="car-form-grid">
    <Field label="Car Make & Model" name="makeModel" form={form} change={change} required /><Field label="Year" name="year" type="number" form={form} change={change} required />
    <Field label="Price (Rs.)" name="price" type="number" form={form} change={change} required /><Select label="Category" name="category" form={form} change={change} options={categories} />
  </div></section><section className="car-form-section"><h3>Vehicle Details</h3><div className="car-form-grid">
    <Field label="Mileage (km)" name="mileage" type="number" form={form} change={change} min="0" required /><Select label="Fuel Type" name="fuelType" form={form} change={change} options={['Petrol', 'Diesel', 'Electric', 'Hybrid']} />
    <Select label="Transmission" name="transmission" form={form} change={change} options={['Manual', 'Automatic']} /><Field label="Engine Capacity (CC)" name="engineCapacity" type="number" form={form} change={change} min="0" />
    <Field label="Color" name="color" form={form} change={change} /><Field label="Variant" name="variant" form={form} change={change} />
  </div></section><section className="car-form-section"><h3>Ownership & Registration</h3><div className="car-form-grid">
    <Field label="Previous Owner Count" name="ownerCount" type="number" form={form} change={change} min="1" required /><Field label="Registration City" name="registrationCity" form={form} change={change} required />
  </div><Check label="Car is registered" name="isRegistered" form={form} change={change} /></section><section className="car-form-section"><h3>Condition</h3><div className="car-form-grid"><Select label="Condition" name="condition" form={form} change={change} options={['Excellent', 'Good', 'Fair']} /></div>
    <Check label="Car has accident history" name="hasAccidentHistory" form={form} change={change} />{form.hasAccidentHistory && <div className="form-group"><label>Accident Notes</label><textarea name="accidentNotes" rows="3" value={form.accidentNotes} onChange={change} /></div>}<Check label="Price is negotiable" name="isNegotiable" form={form} change={change} />
  </section><div className="form-group"><label>Description</label><textarea name="description" rows="3" value={form.description} onChange={change} /></div></>;
}

function Field({ label, name, type = 'text', form, change, required, ...props }) { return <div className="form-group"><label>{label}</label><input name={name} type={type} value={form[name]} onChange={change} required={required} {...props} /></div>; }
function Select({ label, name, form, change, options }) { return <div className="form-group"><label>{label}</label><select name={name} value={form[name]} onChange={change} required><option value="">Select {label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>; }
function Check({ label, name, form, change }) { return <label className="car-form-check"><input type="checkbox" name={name} checked={form[name]} onChange={change} /> {label}</label>; }
