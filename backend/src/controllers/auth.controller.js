const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { validate } = require('../utils/validate');
const { User } = require('../models');
const { nextId } = require('../utils/id');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin','branch-manager','staff','hospital-officer','auditor']).default('staff'),
  branchId: z.string().optional(),
  phone: z.string().optional()
});

async function login(req, res, next) {
  try {
    const { email, password } = validate(loginSchema, req.body);

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    user.last_login = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user.id, role: user.role, branchId: user.branch_id || null },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        branchId: user.branch_id,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (e) { next(e); }
}

async function register(req, res, next) {
  try {
    const payload = validate(registerSchema, req.body);

    const existing = await User.findOne({ where: { email: payload.email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const count = await User.count();
    const id = nextId('USR', count + 1);

    const password_hash = await bcrypt.hash(payload.password, 10);

    const user = await User.create({
      id,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      password_hash,
      role: payload.role,
      branch_id: payload.branchId || null,
      phone: payload.phone || null,
      is_active: true
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      branchId: user.branch_id,
      phone: user.phone,
      isActive: user.is_active,
      createdAt: user.created_at
    });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      branchId: user.branch_id,
      phone: user.phone,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (e) { next(e); }
}

module.exports = { login, register, me };
