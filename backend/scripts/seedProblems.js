const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

dotenv.config();

const problemsData = [
    {
        title: "Two Sum",
        difficulty: "Easy",
        category: "Arrays",
        description: `
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
        `,
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9"
        ],
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
        ],
        starterCode: {
            "javascript": "function twoSum(nums, target) {\n    // Write your code here\n};",
            "python3": "def twoSum(nums, target):\n    # Write your code here\n    pass"
        },
        driverCode: {
            "javascript": "\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const nums = JSON.parse(input[0]);\n    const target = JSON.parse(input[1]);\n    const result = twoSum(nums, target);\n    console.log(JSON.stringify(result));\n}",
            "python3": "\nimport sys, json\ninput_data = sys.stdin.read().strip().split('\\n')\nif len(input_data) >= 2:\n    nums = json.loads(input_data[0])\n    target = json.loads(input_data[1])\n    result = twoSum(nums, target)\n    print(json.dumps(result).replace(' ', ''))\n"
        },
        testCases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
            { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false },
            { input: "[3,3]\n6", output: "[0,1]", isHidden: true }
        ]
    },
    {
        title: "Climbing Stairs",
        difficulty: "Easy",
        category: "Dynamic Programming",
        description: `
<p>You are climbing a staircase. It takes <code>n</code> steps to reach the top.</p>
<p>Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?</p>
        `,
        constraints: [
            "1 <= n <= 45"
        ],
        examples: [
            {
                input: "n = 2",
                output: "2",
                explanation: "There are two ways to climb to the top. 1 step + 1 step, or 2 steps."
            }
        ],
        starterCode: {
            "javascript": "function climbStairs(n) {\n    // Write your code here\n};",
            "python3": "def climbStairs(n):\n    # Write your code here\n    pass"
        },
        driverCode: {
            "javascript": "\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = JSON.parse(input);\n    const result = climbStairs(n);\n    console.log(JSON.stringify(result));\n}",
            "python3": "\nimport sys, json\ninput_data = sys.stdin.read().strip()\nif input_data:\n    n = json.loads(input_data)\n    result = climbStairs(n)\n    print(json.dumps(result))\n"
        },
        testCases: [
            { input: "2", output: "2", isHidden: false },
            { input: "3", output: "3", isHidden: false },
            { input: "4", output: "5", isHidden: true },
            { input: "5", output: "8", isHidden: true }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        await Problem.deleteMany({});
        await TestCase.deleteMany({});

        for (let pData of problemsData) {
            const { testCases, ...problemDetails } = pData;
            const newProblem = await Problem.create(problemDetails);

            for (let tc of testCases) {
                await TestCase.create({
                    problemId: newProblem._id,
                    input: tc.input,
                    output: tc.output,
                    isHidden: tc.isHidden
                });
            }
            console.log(`Added problem: ${newProblem.title}`);
        }

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDB();
