
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Logger = require('../utils/Logger');
const { UserFactory } = require('../factories/UserFactory');

const logger = Logger.getInstance();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // public signup should always land as a student. We should never take the role from the
        // request body here, otherwise anyone could register themselves as admin
        const user = await User.create({ name, email, password });
        logger.info(`New student registered: ${user.email}`);
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        logger.error(`Register failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Admin-only account creation. This is how teacher (and other if choose add them in future) accounts get
// made, since public signup is locked to students.
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role });
        logger.info(`Admin ${req.user.email} created ${role}: ${user.email}`);
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        logger.error(`Admin create user failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            // let the factory decide this account's capabilities + the landing route
            const account = UserFactory.create(user);
            logger.info(`Login: ${user.email} (${user.role})`);
            res.json({
                email: user.email,
                token: generateToken(user.id),
                ...account.toAuthPayload(),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        university: user.university,
        address: user.address,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.university = university || user.university;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, university: updatedUser.university, address: updatedUser.address, token: generateToken(updatedUser.id), role: updatedUser.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, createUser, loginUser, updateUserProfile, getProfile };
