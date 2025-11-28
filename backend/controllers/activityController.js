const DailyActivity = require('../models/DailyActivity');

exports.getActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const formattedDate = ninetyDaysAgo.toISOString().split('T')[0];

        const activities = await DailyActivity.find({
            userId,
            date: { $gte: formattedDate }
        }).sort({ date: 1 });

        res.status(200).json({
            status: 'success',
            data: { activities }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, problemsSolved } = req.body;
        
        // Today's date by default if not provided
        const activityDate = date || new Date().toISOString().split('T')[0];

        const updatedActivity = await DailyActivity.findOneAndUpdate(
            { userId, date: activityDate },
            { $inc: { problemsSolved: problemsSolved || 1 } },
            { new: true, upsert: true }
        );

        res.status(200).json({
            status: 'success',
            data: { activity: updatedActivity }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
