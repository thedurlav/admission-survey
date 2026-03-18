const express = require('express');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/surveyors — list all surveyors (admin only)
router.get('/surveyors', protect, adminOnly, async (req, res) => {
  try {
    const surveyors = await User.find({ role: 'surveyor' }).select('-password').sort({ createdAt: -1 });
    res.json(surveyors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/surveyors — create new surveyor (admin only)
router.post('/surveyors', protect, adminOnly, async (req, res) => {
  try {
    const { username, password, fullName } = req.body;
    if (!username || !password || !fullName)
      return res.status(400).json({ message: 'Username, password and full name are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Username already taken' });

    const user = await User.create({ username, password, fullName, role: 'surveyor' });
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/users/surveyors/:id/toggle — activate/deactivate
router.patch('/surveyors/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'surveyor')
      return res.status(404).json({ message: 'Surveyor not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/surveyors/:id
router.delete('/surveyors/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Surveyor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
