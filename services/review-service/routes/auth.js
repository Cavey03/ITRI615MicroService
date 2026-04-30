const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Joi     = require('joi');
const { createUser, findUserByEmail } = require('../models/user');
const logger  = require('../config/logger');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existing = await findUserByEmail(value.email);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(value.password, 12);
    const user  = await createUser({ ...value, passwordHash });
    const token = signToken(user);

    logger.info('User registered', { userId: user.id, username: user.username });
    res.status(201).json({ token, user });
  } catch (err) {
    logger.error('Registration failed', { error: err.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = await findUserByEmail(value.email);
    if (!user) {
      logger.warn('Login failed - email not found', { email: value.email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(value.password, user.password_hash);
    if (!match) {
      logger.warn('Login failed - wrong password', { userId: user.id });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    logger.info('User logged in', { userId: user.id, username: user.username });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Login failed', { error: err.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
