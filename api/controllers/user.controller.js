import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!password || !email || email === '' || password === '') {
            return next(errorHandler(400, 'All fields are required'));
        };

        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(200).json('User created successfully');

    } catch (error) {
        if (error.code === 11000) {
            next(errorHandler(403, 'Email is already exists!!'))
        } else {
            next(error);
        }
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!password || !email || email === '' || password === '') {
        return next(errorHandler(400, 'All fields are required'));
    };

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, 'User not found!!'))
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(404, 'Invalid credential'))
        }

        const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: '2d' });

        const { password: pass, ...rest } = validUser._doc;

        res.cookie('access_token', token, { 
            httpOnly: true, 
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) 
        }).status(200).json(rest);

    } catch (error) {
        next(error)
    }
};

export const signout = (req, res, next) => {
    try {
        res.clearCookie('access_token').status(200).json('User Logged out!')
    } catch (error) {
        next(error);
    }
};