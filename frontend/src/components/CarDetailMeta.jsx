const details = (car) => [
  ['Year', car.year], ['Category', car.category], ['Mileage', car.mileage !== undefined ? `${car.mileage.toLocaleString()} km` : 'Not specified'],
  ['Fuel Type', car.fuelType], ['Transmission', car.transmission], ['Owners', car.ownerCount],
  ['Registration City', car.registrationCity], ['Condition', car.condition], ['Variant', car.variant || 'Not specified'],
  ['Engine', car.engineCapacity ? `${car.engineCapacity} CC` : 'Not specified'], ['Color', car.color || 'Not specified'],
  ['Registration', car.isRegistered ? 'Registered' : 'Unregistered'], ['Views', car.views], ['Status', car.status],
];

export default function CarDetailMeta({ car }) {
  return <div className="detail-meta-grid">{details(car).map(([label, value]) => <div className="detail-meta-card" key={label}><div className="detail-meta-label">{label}</div><div className="detail-meta-value">{value || 'Not specified'}</div></div>)}</div>;
}
