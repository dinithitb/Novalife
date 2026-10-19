const { z } = require('zod');
const { validate } = require('../utils/validate');
const { Branch } = require('../models');
const { nextId } = require('../utils/id');

const createSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  managerId: z.string().optional(),
  isActive: z.boolean().optional()
});

function toDto(b) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    email: b.email,
    managerId: b.manager_id || undefined,
    isActive: b.is_active,
    createdAt: b.created_at
  };
}

async function list(req, res, next) {
  try {
    const items = await Branch.findAll({ order: [['id','ASC']] });
    res.json(items.map(toDto));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const payload = validate(createSchema, req.body);
    const count = await Branch.count();
    const id = nextId('BR', count + 1);

    const branch = await Branch.create({
      id,
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
      manager_id: payload.managerId || null,
      is_active: payload.isActive ?? true
    });
    res.status(201).json(toDto(branch));
  } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(toDto(branch));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const payload = validate(createSchema.partial(), req.body);
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    if (payload.name !== undefined) branch.name = payload.name;
    if (payload.address !== undefined) branch.address = payload.address;
    if (payload.phone !== undefined) branch.phone = payload.phone;
    if (payload.email !== undefined) branch.email = payload.email;
    if (payload.managerId !== undefined) branch.manager_id = payload.managerId || null;
    if (payload.isActive !== undefined) branch.is_active = payload.isActive;

    await branch.save();
    res.json(toDto(branch));
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    await branch.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { list, create, get, update, remove };
