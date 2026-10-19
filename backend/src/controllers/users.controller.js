const bcrypt = require('bcrypt');
const { z } = require('zod');
const { validate } = require('../utils/validate');
const { User, Branch } = require('../models');
const { nextId } = require('../utils/id');

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin','branch-manager','staff','hospital-officer','auditor']),
  branchId: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['admin','branch-manager','staff','hospital-officer','auditor']).optional(),
  branchId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

function toDto(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    role: u.role,
    branchId: u.branch_id || undefined,
    phone: u.phone || undefined,
    isActive: u.is_active,
    createdAt: u.created_at,
    lastLogin: u.last_login || undefined,
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.role) where.role = String(req.query.role);
    if (req.query.branchId) where.branch_id = String(req.query.branchId);
    if (req.query.isActive !== undefined) where.is_active = String(req.query.isActive) === 'true';
    const users = await User.findAll({ where, order: [['created_at', 'ASC']] });
    res.json(users.map(toDto));
  } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(toDto(user));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const payload = validate(createSchema, req.body);
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
      is_active: payload.isActive ?? true,
    });
    res.status(201).json(toDto(user));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const payload = validate(updateSchema, req.body);
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (payload.email !== undefined) {
      const clash = await User.findOne({ where: { email: payload.email } });
      if (clash && clash.id !== user.id) return res.status(400).json({ error: 'Email already exists' });
      user.email = payload.email;
    }
    if (payload.firstName !== undefined) user.first_name = payload.firstName;
    if (payload.lastName !== undefined) user.last_name = payload.lastName;
    if (payload.role !== undefined) user.role = payload.role;
    if (payload.branchId !== undefined) user.branch_id = payload.branchId;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.isActive !== undefined) user.is_active = payload.isActive;
    if (payload.password) user.password_hash = await bcrypt.hash(payload.password, 10);

    await user.save();
    res.json(toDto(user));
  } catch (e) { next(e); }
}

async function deactivate(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.userId) return res.status(400).json({ error: 'Cannot deactivate yourself' });
    user.is_active = false;
    await user.save();
    res.json(toDto(user));
  } catch (e) { next(e); }
}

async function activate(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.is_active = true;
    await user.save();
    res.json(toDto(user));
  } catch (e) { next(e); }
}

module.exports = { list, get, create, update, deactivate, activate };
