const Stats = require('../models/statsModel');

const statsController = {
  getDashboardStats: async (req, res) => {
    try {
      const stats = await Stats.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error in stats controller:', error);
      res.status(500).json({
        error: 'Server error retrieving dashboard statistics',
      });
    }
  }
};

module.exports = statsController;