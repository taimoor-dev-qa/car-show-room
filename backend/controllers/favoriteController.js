const User = require('../models/user');

// @route POST /api/favorites/:carId   (toggle — agar already hai to hatao, warna add karo)
const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const carId = req.params.carId;

    const index = user.favorites.findIndex((id) => id.toString() === carId);

    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      return res.json({ favorited: false });
    } else {
      user.favorites.push(carId);
      await user.save();
      return res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/favorites   (buyer ki saari saved cars)
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleFavorite, getFavorites };