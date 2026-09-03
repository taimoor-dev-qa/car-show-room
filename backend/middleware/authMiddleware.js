const jwt = require('jsonwebtoken');

// Check karta hai ke user logged in hai (valid token hai)
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Check karta hai ke user seller hai
const sellerOnly = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can do this' });
  }
  next();
};

module.exports = { protect, sellerOnly };