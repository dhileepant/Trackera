const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const DailyActivity = require('../models/DailyActivity');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch data
        const user = await User.findById(userId);
        const progresses = await Progress.find({ userId, status: 'Solved' }).populate('problemId');
        const activities = await DailyActivity.find({ userId }).sort({ date: 1 });

        // Calculate Streak Data
        let currentStreak = 0;
        let maxStreak = 0;
        let longestGap = 0;
        let tempStreak = 0;
        let tempGap = 0;
        
        let prevDate = null;
        
        const activityMap = new Map();
        activities.forEach(a => {
            activityMap.set(a.date, a.problemsSolved);
        });

        // 90 days loop to build streaks accurately avoiding pure gaps
        const today = new Date();
        const dateList = [];
        for (let i = 89; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            const solved = activityMap.get(ds) || 0;
            
            if (solved > 0) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
                tempGap = 0;
                
                // Track longest gap before next solve happens?
                // we calculate consecutive zero days
            } else {
                tempStreak = 0;
                tempGap++;
                longestGap = Math.max(longestGap, tempGap);
            }
            
            // for current streak, reverse check
            dateList.push({ date: ds, solved });
        }
        
        // current streak
        for (let i = dateList.length - 1; i >= 0; i--) {
            if (dateList[i].solved > 0) currentStreak++;
            else if (i !== dateList.length - 1) break; // if today is 0 it's fine, check yesterday, but if strictly streak broken
        }

        // Calculate Weekly & Monthly
        let weeklySolved = 0;
        let weeklyActiveDays = 0;
        let monthlySolved = 0;
        
        for (let i = dateList.length - 1; i >= Math.max(0, dateList.length - 30); i--) {
            monthlySolved += dateList[i].solved;
            if (i >= dateList.length - 7) {
                weeklySolved += dateList[i].solved;
                if (dateList[i].solved > 0) weeklyActiveDays++;
            }
        }
        
        // Performance Graph Data (last 14 days)
        const performanceData = dateList.slice(-14).map(d => ({
            name: d.date.substring(5), // MM-DD
            solved: d.solved
        }));

        // Difficulty & Topic Stats
        const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };
        const topicStats = {};

        progresses.forEach(p => {
            if (p.problemId) {
                difficultyStats[p.problemId.difficulty]++;
            }
            if (p.category) {
                topicStats[p.category] = (topicStats[p.category] || 0) + 1;
            }
        });

        // Smart Insights Logic
        let insights = [];
        if (currentStreak >= 3) insights.push(`You are on a ${currentStreak}-day streak! Keep the consistency up 🔥`);
        else if (longestGap > 5) insights.push(`Try to solve at least 1 problem a day to maintain rhythm.`);
        
        if (weeklySolved > 10) insights.push(`Amazing effort this week with ${weeklySolved} problems solved!`);
        
        // Find weakest topic? That's harder without total problems per topic. Let's find strongest.
        const sortedTopics = Object.entries(topicStats).sort((a,b) => b[1] - a[1]);
        if (sortedTopics.length > 0) {
            insights.push(`You are strong in ${sortedTopics[0][0]}, having solved ${sortedTopics[0][1]} problems.`);
        }

        res.status(200).json({
            status: 'success',
            data: {
                streak: {
                    current: currentStreak,
                    max: maxStreak,
                    longestGap
                },
                weeklyStats: {
                    solved: weeklySolved,
                    activeDays: weeklyActiveDays
                },
                monthlyStats: {
                    solved: monthlySolved,
                    avgPerDay: (monthlySolved / 30).toFixed(1)
                },
                difficultyStats,
                topicStats,
                platformStats: {
                    leetcode: user.leetcodeStats,
                    codeforces: user.codeforcesStats,
                    github: user.githubStats,
                    codechef: user.codechefStats,
                    geeksforgeeks: user.gfgStats
                },
                performanceData,
                insights
            }
        });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(400).json({ status: 'error', message: err.message });
    }
};
