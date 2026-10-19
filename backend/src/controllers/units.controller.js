const { z } = require('zod');
const { validate } = require('../utils/validate');
const { BloodUnit, Donor, Notification } = require('../models');
const { nextId } = require('../utils/id');

const unitSchema = z.object({
  donorId: z.string().min(1),
  bloodGroup: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-']),
  component: z.enum(['Whole Blood','Red Blood Cells','Platelets','Plasma','Cryoprecipitate']),
  collectionDate: z.string().min(4),
  expiryDate: z.string().min(4),
  status: z.enum(['available','reserved','issued','expired','discarded','in-transit']).optional(),
  branchId: z.string().min(1),
  volume: z.number().int().positive(),
  testResults: z.object({
    hiv: z.boolean(),
    hepatitisB: z.boolean(),
    hepatitisC: z.boolean(),
    syphilis: z.boolean(),
    malaria: z.boolean()
  }).optional()
});

const statusSchema = z.object({
  status: z.enum(['available','reserved','issued','expired','discarded','in-transit'])
});

function toDto(u) {
  return {
    id: u.id,
    donorId: u.donor_id,
    bloodGroup: u.blood_group,
    component: u.component,
    collectionDate: new Date(u.collection_date),
    expiryDate: new Date(u.expiry_date),
    status: u.status,
    branchId: u.branch_id,
    volume: u.volume,
    testResults: u.test_results || undefined,
    createdAt: u.created_at,
    updatedAt: u.updated_at
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.branchId) where.branch_id = String(req.query.branchId);
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.bloodGroup) where.blood_group = String(req.query.bloodGroup);
    const items = await BloodUnit.findAll({ where, order: [['id','ASC']] });
    res.json(items.map(toDto));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const payload = validate(unitSchema, req.body);

    const donor = await Donor.findByPk(payload.donorId);
    if (!donor) {
      const err = new Error('Invalid donorId');
      err.status = 400;
      throw err;
    }

    const count = await BloodUnit.count();
    const id = nextId('UNT', count + 1);

    const unit = await BloodUnit.create({
      id,
      donor_id: payload.donorId,
      blood_group: payload.bloodGroup,
      component: payload.component,
      collection_date: payload.collectionDate,
      expiry_date: payload.expiryDate,
      status: payload.status || 'available',
      branch_id: payload.branchId,
      volume: payload.volume,
      test_results: payload.testResults || null
    });

    // Simple low-stock notification example (optional): if available for that bloodGroup+branch < 3 => notify
    const availableCount = await BloodUnit.count({ where: { branch_id: payload.branchId, blood_group: payload.bloodGroup, status: 'available' }});
    if (availableCount < 3) {
      const ncount = await Notification.count();
      await Notification.create({
        id: nextId('NOT', ncount + 1),
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `Available units for ${payload.bloodGroup} at ${payload.branchId} dropped below threshold.`,
        branch_id: payload.branchId,
        is_read: false,
        priority: 'high'
      });
    }

    res.status(201).json(toDto(unit));
  } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const unit = await BloodUnit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.json(toDto(unit));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const payload = validate(unitSchema.partial(), req.body);
    const unit = await BloodUnit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    if (payload.donorId !== undefined) unit.donor_id = payload.donorId;
    if (payload.bloodGroup !== undefined) unit.blood_group = payload.bloodGroup;
    if (payload.component !== undefined) unit.component = payload.component;
    if (payload.collectionDate !== undefined) unit.collection_date = payload.collectionDate;
    if (payload.expiryDate !== undefined) unit.expiry_date = payload.expiryDate;
    if (payload.status !== undefined) unit.status = payload.status;
    if (payload.branchId !== undefined) unit.branch_id = payload.branchId;
    if (payload.volume !== undefined) unit.volume = payload.volume;
    if (payload.testResults !== undefined) unit.test_results = payload.testResults || null;

    await unit.save();
    res.json(toDto(unit));
  } catch (e) { next(e); }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = validate(statusSchema, req.body);
    const unit = await BloodUnit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    unit.status = status;
    await unit.save();
    res.json(toDto(unit));
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const unit = await BloodUnit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    await unit.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { list, create, get, update, updateStatus, remove };
