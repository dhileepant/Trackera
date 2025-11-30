const axios = require('axios');
const User = require('../models/User');
const Placement = require('../models/Placement');
const { fetchLeetCodeStats, fetchGitHubStats, fetchCodeforcesStats, fetchCodeChefStats, fetchGFGStats } = require('../utils/statsFetcher');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.syncPlatforms = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let leetcodeStats = user.leetcodeStats;
        let githubStats = user.githubStats;
        let codeforcesStats = user.codeforcesStats;
        let codechefStats = user.codechefStats;
        let gfgStats = user.gfgStats;

        if (user.leetcodeUsername) {
            const fetchedLeet = await fetchLeetCodeStats(user.leetcodeUsername);
            if (fetchedLeet) leetcodeStats = fetchedLeet;
        }

        if (user.githubUsername) {
            const fetchedGit = await fetchGitHubStats(user.githubUsername);
            if (fetchedGit) githubStats = fetchedGit;
        }

        if (user.codeforcesHandle) {
            const fetchedCF = await fetchCodeforcesStats(user.codeforcesHandle);
            if (fetchedCF) codeforcesStats = fetchedCF;
        }

        if (user.codechefUsername) {
            const fetchedCC = await fetchCodeChefStats(user.codechefUsername);
            if (fetchedCC) codechefStats = fetchedCC;
        }

        if (user.geeksforgeeksUsername) {
            const fetchedGFG = await fetchGFGStats(user.geeksforgeeksUsername);
            if (fetchedGFG) gfgStats = fetchedGFG;
        }

        user.leetcodeStats = leetcodeStats;
        user.githubStats = githubStats;
        user.codeforcesStats = codeforcesStats;
        user.codechefStats = codechefStats;
        user.gfgStats = gfgStats;
        user.lastSynced = new Date();
        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getPlatformStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            leetcode: {
                totalSolved: user.leetcodeStats.totalSolved,
                easySolved: user.leetcodeStats.easySolved,
                mediumSolved: user.leetcodeStats.mediumSolved,
                hardSolved: user.leetcodeStats.hardSolved,
                contestRating: user.leetcodeStats.contestRating,
                ranking: user.leetcodeStats.ranking,
                streak: user.leetcodeStats.streak
            },
            github: {
                repos: user.githubStats.publicRepos,
                followers: user.githubStats.followers,
                following: user.githubStats.following,
                contributions: user.githubStats.contributions,
                language: user.githubStats.language
            },
            codeforces: {
                rating: user.codeforcesStats.rating,
                maxRating: user.codeforcesStats.maxRating,
                rank: user.codeforcesStats.rank,
                maxRank: user.codeforcesStats.maxRank,
                contests: user.codeforcesStats.contests,
                contribution: user.codeforcesStats.contribution
            },
            codechef: {
                rating: user.codechefStats.rating,
                stars: user.codechefStats.stars,
                globalRank: user.codechefStats.globalRank
            },
            geeksforgeeks: {
                problemsSolved: user.gfgStats.problemsSolved,
                score: user.gfgStats.score,
                institutionRank: user.gfgStats.institutionRank
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updatePlatforms = async (req, res) => {
    try {
        const { leetcodeUsername, codeforcesHandle, githubUsername, cgpa } = req.body;
        
        let updateData = { leetcodeUsername, codeforcesHandle, githubUsername, cgpa };

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const { 
            name, 
            college, 
            city, 
            year, 
            cgpa, 
            leetcodeUsername, 
            githubUsername, 
            codeforcesHandle,
            codechefUsername,
            geeksforgeeksUsername
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                name, 
                college, 
                city, 
                year, 
                cgpa, 
                leetcodeUsername, 
                githubUsername, 
                codeforcesHandle,
                codechefUsername,
                geeksforgeeksUsername
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getPlacements = async (req, res) => {
    try {
        const placements = await Placement.find({ student: req.user.id }).populate('company');
        res.status(200).json({ status: 'success', data: { placements } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};