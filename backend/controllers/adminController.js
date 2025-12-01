const User = require('../models/User');
const Company = require('../models/Company');
const Placement = require('../models/Placement');

exports.getAnalytics = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        // Count placed students by checking if they have any placement with 'Selected' status
        const placedPlacements = await Placement.find({ status: 'Selected' }).distinct('student');
        const placedStudentsCount = placedPlacements.length;
        const notPlacedStudentsCount = totalStudents - placedStudentsCount;
        const placementRate = totalStudents > 0 ? ((placedStudentsCount / totalStudents) * 100).toFixed(1) : 0;

        // Data for charts
        const placements = await Placement.find({ status: 'Selected' }).populate('company');
        const companyPlacedCounts = {};
        placements.forEach(p => {
            if (p.company && p.company.name) {
                companyPlacedCounts[p.company.name] = (companyPlacedCounts[p.company.name] || 0) + 1;
            }
        });
        const chartData = Object.keys(companyPlacedCounts).map(name => ({
            name,
            placed: companyPlacedCounts[name]
        }));

        res.status(200).json({
            status: 'success',
            data: {
                totalStudents,
                placedStudents: placedStudentsCount,
                notPlacedStudents: notPlacedStudentsCount,
                placementRate,
                chartData
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        // Find all students, you could also add pagination or search filters here.
        const students = await User.find({ role: 'student' });
        const placements = await Placement.find().populate('company');

        const studentsWithStatus = students.map(student => {
            const studentPlacements = placements.filter(p => p.student.toString() === student._id.toString());
            const isPlaced = studentPlacements.some(p => p.status === 'Selected');
            
            return {
                id: student._id,
                name: student.name,
                email: student.email,
                cgpa: student.cgpa || 'N/A', // Assume cgpa exists or defaults
                status: isPlaced ? 'Placed' : 'Not Placed',
                college: student.college,
                placements: studentPlacements
            };
        });

        res.status(200).json({ status: 'success', data: { students: studentsWithStatus } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { cgpa, college, city } = req.body;
        const student = await User.findByIdAndUpdate(req.params.id, { cgpa, college, city }, { new: true, runValidators: true });
        res.status(200).json({ status: 'success', data: { student } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({ status: 'success', data: { companies } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.createCompany = async (req, res) => {
    try {
        const newCompany = await Company.create(req.body);
        res.status(201).json({ status: 'success', data: { company: newCompany } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ status: 'success', data: { company } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getPlacements = async (req, res) => {
    try {
        const placements = await Placement.find().populate('student').populate('company');
        res.status(200).json({ status: 'success', data: { placements } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.createPlacement = async (req, res) => {
    try {
        const placement = await Placement.create(req.body);
        res.status(201).json({ status: 'success', data: { placement } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updatePlacement = async (req, res) => {
    try {
        const placement = await Placement.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json({ status: 'success', data: { placement } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
