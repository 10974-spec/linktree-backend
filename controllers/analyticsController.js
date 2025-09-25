const Analytics = require('../models/Analytics');
const Link = require('../models/Link');

const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get total clicks and profile views
    const totalClicks = await Analytics.countDocuments({
      user: req.user._id,
      ...dateFilter
    });

    // Get clicks per day for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await Analytics.aggregate([
      {
        $match: {
          user: req.user._id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing links
    const topLinks = await Link.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $lookup: {
          from: 'analytics',
          localField: '_id',
          foreignField: 'link',
          as: 'analytics'
        }
      },
      {
        $project: {
          title: 1,
          url: 1,
          clicks: 1,
          analyticsCount: { $size: '$analytics' }
        }
      },
      { $sort: { analyticsCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalClicks,
      dailyClicks,
      topLinks,
      timeRange: {
        startDate: startDate || thirtyDaysAgo.toISOString(),
        endDate: endDate || new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLinkAnalytics = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify link belongs to user
    const link = await Link.findOne({ _id: linkId, user: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find({
      link: linkId,
      ...dateFilter
    }).sort({ timestamp: -1 });

    // Get referrer data
    const referrerData = await Analytics.aggregate([
      {
        $match: {
          link: linkId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      link: {
        title: link.title,
        url: link.url,
        totalClicks: link.clicks
      },
      analytics,
      referrerData,
      totalRecords: analytics.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAnalytics,
  getLinkAnalytics
};