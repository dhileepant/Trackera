const axios = require('axios');

const fetchLeetCodeStats = async (username) => {
    try {
        const query = `
        query getUserProfile($username: String!) {
            allQuestionsCount {
                difficulty
                count
            }
            matchedUser(username: $username) {
                username
                contributions {
                    points
                }
                profile {
                    ranking
                    reputation
                    starRating
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
            }
            userContestRanking(username: $username) {
                rating
                globalRanking
            }
        }`;

        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            }
        });

        const data = response.data.data;
        if (!data.matchedUser) throw new Error('LeetCode user not found');

        const stats = data.matchedUser.submitStats.acSubmissionNum;
        
        return {
            totalSolved: stats.find(s => s.difficulty === 'All')?.count || 0,
            easySolved: stats.find(s => s.difficulty === 'Easy')?.count || 0,
            mediumSolved: stats.find(s => s.difficulty === 'Medium')?.count || 0,
            hardSolved: stats.find(s => s.difficulty === 'Hard')?.count || 0,
            contestRating: Math.round(data.userContestRanking?.rating || 0),
            ranking: data.matchedUser.profile.ranking || 0,
            streak: 0 // Streak is harder to get via public graphql without auth session
        };
    } catch (err) {
        console.error('LeetCode Fetch Error:', err.message);
        return null;
    }
};

const fetchGitHubStats = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        const data = response.data;

        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        const repos = reposResponse.data;
        
        let languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        
        const mostUsedLanguage = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b, 'None');

        return {
            publicRepos: data.public_repos,
            followers: data.followers,
            following: data.following,
            contributions: 0, // Requires more complex API usage
            language: mostUsedLanguage
        };
    } catch (err) {
        console.error('GitHub Fetch Error:', err.message);
        return null;
    }
};

const fetchCodeforcesStats = async (handle) => {
    try {
        const [userRes, ratingRes] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
            axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`)
        ]);

        if (userRes.data.status !== 'OK') throw new Error('Codeforces user not found');
        
        const userData = userRes.data.result[0];
        const ratingData = ratingRes.data.result;

        return {
            rating: userData.rating || 0,
            maxRating: userData.maxRating || 0,
            rank: userData.rank || 'unrated',
            maxRank: userData.maxRank || 'unrated',
            contests: ratingData.length,
            contribution: userData.contribution || 0
        };
    } catch (err) {
        console.error('Codeforces Fetch Error:', err.message);
        return null;
    }
};

const fetchCodeChefStats = async (username) => {
    try {
        const response = await axios.get(`https://www.codechef.com/users/${username}`, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            }
        });
        const html = response.data;
        
        const ratingMatch = html.match(/<div class="rating-number">(\d+)<\/div>/);
        const starsMatch = html.match(/<span class="rating">(\d+★)<\/span>/);
        const globalRankMatch = html.match(/<strong>(\d+)<\/strong>[^<]*Global Rank/);

        return {
            rating: parseInt(ratingMatch?.[1] || 0),
            stars: starsMatch?.[1] || '1★',
            globalRank: parseInt(globalRankMatch?.[1] || 0)
        };
    } catch (err) {
        console.error('CodeChef Fetch Error:', err.message);
        return null;
    }
};

const fetchGFGStats = async (username) => {
    try {
        const response = await axios.get(`https://www.geeksforgeeks.org/user/${username}/`, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            }
        });
        const html = response.data;
        
        // Better regex for GFG's current layout
        const solvedMatch = html.match(/(\d+)\s+Problems Solved/i);
        const scoreMatch = html.match(/(\d+)\s+Coding Score/i);
        const rankMatch = html.match(/(\d+)\s+Institution Rank/i);

        return {
            problemsSolved: parseInt(solvedMatch?.[1] || 0),
            score: parseInt(scoreMatch?.[1] || 0),
            institutionRank: parseInt(rankMatch?.[1] || 0)
        };
    } catch (err) {
        console.error('GFG Fetch Error:', err.message);
        return null;
    }
};

module.exports = {
    fetchLeetCodeStats,
    fetchGitHubStats,
    fetchCodeforcesStats,
    fetchCodeChefStats,
    fetchGFGStats
};
