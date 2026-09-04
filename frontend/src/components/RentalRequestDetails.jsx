export default function RentalRequestDetails({ request, sellerView = false }) {
  const returnAddress = request.returnSameAsPickup ? request.pickupAddress : request.returnAddress || 'Not provided';
  return <div className="request-details">
    <span><strong>Passengers:</strong> {request.passengerCount}</span><span><strong>Purpose:</strong> {request.rentalPurpose}</span>
    <span><strong>Pickup:</strong> {request.pickupAddress}</span><span><strong>Return:</strong> {returnAddress}</span>
    <span><strong>Contact:</strong> {request.contactName || 'Account holder'} ({request.contactPhone})</span>
    <span><strong>CNIC:</strong> {request.cnicNumber || 'Not available'}</span>
    <span><strong>Distance:</strong> {request.estimatedDistance ? `${request.estimatedDistance} km` : 'Not specified'}</span>
    <span><strong>Payment:</strong> {request.paymentMethod}</span><span><strong>Driver:</strong> {request.driverRequested ? 'Requested' : 'Self drive'}</span>
    <span><strong>Deposit:</strong> {request.depositAcknowledged ? 'Acknowledged' : 'Not acknowledged'}</span>
    <span><strong>Terms:</strong> {request.termsAccepted ? 'Accepted' : 'Not accepted'}</span>
    {sellerView && <span><strong>License:</strong> {request.licenseConfirmed ? 'Confirmed' : 'Not confirmed'}</span>}
    {request.pickupNotes && <span className="request-notes"><strong>Notes:</strong> {request.pickupNotes}</span>}
  </div>;
}
