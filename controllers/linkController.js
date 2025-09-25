const Link = require('../models/Link');
const Analytics = require('../models/Analytics');
const { validate } = require('../utils/validationSchemas');
const { schemas } = require('../utils/validationSchemas');

const getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.user._id }).sort({ position: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createLink = async (req, res) => {
  try {
    const { title, url, icon } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    const lastLink = await Link.findOne({ user: req.user._id }).sort({ position: -1 });
    const position = lastLink ? lastLink.position + 1 : 0;

    const link = await Link.create({
      user: req.user._id,
      title,
      url,
      icon: icon || '🔗',
      position
    });

    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, icon, position } = req.body;

    const link = await Link.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title, url, icon, position },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOneAndDelete({ _id: id, user: req.user._id });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const recordClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Link.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    
    await Analytics.create({
      link: id,
      user: req.user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer')
    });

    res.json({ message: 'Click recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserLinks,
  createLink,
  updateLink,
  deleteLink,
  recordClick
};