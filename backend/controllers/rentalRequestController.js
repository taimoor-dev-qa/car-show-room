const RentalCar = require('../models/RentalCar');
const RentalRequest = require('../models/RentalRequest');
const User = require('../models/user');

const daysBetween = (startDate, endDate) => Math.ceil(
  (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
);

const validRange = (rentalCar, startDate, endDate, totalDays) => (
  startDate < endDate
  && startDate >= rentalCar.availableFrom
  && endDate <= rentalCar.availableUntil
  && totalDays >= rentalCar.minRentalDays
  && totalDays <= rentalCar.maxRentalDays
);

const maskCnic = (cnicNumber = '') => {
  let hiddenDigits = Math.max(cnicNumber.replace(/\D/g, '').length - 4, 0);
  return cnicNumber.replace(/\d/g, (digit) => (hiddenDigits-- > 0 ? '•' : digit));
};
const maskRequest = (request) => ({ ...request.toObject(), cnicNumber: maskCnic(request.cnicNumber) });

const hasRequiredDetails = (data) => (
  data.passengerCount && Number(data.passengerCount) >= 1
  && data.pickupAddress?.trim() && data.contactPhone?.trim()
  && data.cnicNumber?.trim() && data.rentalPurpose && data.paymentMethod
);

const createRequest = async (req, res) => {
  try {
    const {
      rentalCarId, startDate, endDate, driverRequested = false, pickupNotes,
      passengerCount, pickupAddress, returnSameAsPickup = true, returnAddress,
      contactPhone, contactName, cnicNumber, rentalPurpose, estimatedDistance,
      depositAcknowledged, paymentMethod, termsAccepted, licenseConfirmed = false,
    } = req.body;
    if (!hasRequiredDetails(req.body)) {
      return res.status(400).json({ message: 'Please complete all required rental details' });
    }
    if (depositAcknowledged !== true || termsAccepted !== true) {
      return res.status(400).json({ message: 'Deposit acknowledgement and rental terms are required' });
    }
    if (!driverRequested && licenseConfirmed !== true) {
      return res.status(400).json({ message: 'A valid driving license must be confirmed for self drive' });
    }
    const rentalCar = await RentalCar.findById(rentalCarId);
    if (!rentalCar) return res.status(404).json({ message: 'Rental car not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = daysBetween(start, end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || !validRange(rentalCar, start, end, totalDays)) {
      return res.status(400).json({ message: 'Choose dates within the car availability and rental-day limits' });
    }
    if (driverRequested && !rentalCar.driverAvailable) {
      return res.status(400).json({ message: 'A driver is not available for this rental car' });
    }

    const driverCost = driverRequested ? (rentalCar.driverCharges || 0) : 0;
    const buyer = await User.findById(req.user.id).select('name');
    const request = await RentalRequest.create({
      rentalCar: rentalCar._id,
      buyer: req.user.id,
      seller: rentalCar.seller,
      startDate: start,
      endDate: end,
      totalDays,
      estimatedTotal: (rentalCar.dailyRate + driverCost) * totalDays,
      driverRequested,
      pickupNotes,
      passengerCount,
      pickupAddress,
      returnSameAsPickup,
      returnAddress: returnSameAsPickup ? undefined : returnAddress,
      contactPhone,
      contactName: contactName?.trim() || buyer?.name,
      cnicNumber,
      rentalPurpose,
      estimatedDistance: estimatedDistance || undefined,
      depositAcknowledged,
      paymentMethod,
      termsAccepted,
      licenseConfirmed,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await RentalRequest.find({ buyer: req.user.id })
      .populate('rentalCar', 'makeModel images dailyRate')
      .populate('seller', 'name businessName')
      .sort({ createdAt: -1 });
    res.json(requests.map(maskRequest));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSellerRequests = async (req, res) => {
  try {
    const requests = await RentalRequest.find({ seller: req.user.id })
      .populate('rentalCar', 'makeModel images dailyRate')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests.map(maskRequest));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSellerRequestById = async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.id)
      .populate('rentalCar', 'makeModel images dailyRate')
      .populate('buyer', 'name email');
    if (!request) return res.status(404).json({ message: 'Rental request not found' });
    if (request.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Not your rental request' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }
    const request = await RentalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Rental request not found' });
    if (request.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Not your rental request' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be updated' });

    request.status = status;
    await request.save();
    if (status === 'accepted') await RentalCar.findByIdAndUpdate(request.rentalCar, { status: 'reserved' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Rental request not found' });
    if (request.buyer.toString() !== req.user.id) return res.status(403).json({ message: 'Not your rental request' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be cancelled' });

    request.status = 'cancelled';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRequest, getMyRequests, getSellerRequests, getSellerRequestById, updateRequestStatus, cancelRequest };
