import express from 'express';
import { login, signout, register } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/signout', signout);

export default router;