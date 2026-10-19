const { z } = require('zod');
const { validate } = require('../utils/validate');
const { BranchTransfer, BloodUnit, Notification } = require('../models');
const { nextId } = require('../utils/id');

const transferSchema = z.object({
  fromBranchId: z.string().min(1),
  toBranchId: z.string().min(1),
  unitIds: z.array(z.string()).min(1),
  requestedBy: z.string().min(1),
  reason: z.string().min(1)
});

function toDto(t) {
  return {
    id: t.id,
    fromBranchId: t.from_branch_id,
    toBranchId: t.to_branch_id,
    unitIds: t.unit_ids,
    status: t.status,
    requestedBy: t.requested_by,
    approvedBy: t.approved_by || undefined,
    reason: t.reason,
    createdAt: t.created_at,
    completedAt: t.completed_at || undefined
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.fromBranchId) where.from_branch_id = String(req.query.fromBranchId);
    if (req.query.toBranchId) where.to_branch_id = String(req.query.toBranchId);

    const items = await BranchTransfer.findAll({ where, order: [['created_at','DESC']] });
    res.json(items.map(toDto));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const payload = validate(transferSchema, req.body);
    const count = await BranchTransfer.count();
    const id = nextId('TRF', count + 1);

    // mark units as in-transit only after shipping; for now ensure units exist
    const units = await BloodUnit.findAll({ where: { id: payload.unitIds }});
    if (units.length !== payload.unitIds.length) {
      const err = new Error('Some unitIds are invalid');
      err.status = 400;
      throw err;
    }

    const transfer = await BranchTransfer.create({
      id,
      from_branch_id: payload.fromBranchId,
      to_branch_id: payload.toBranchId,
      unit_ids: payload.unitIds,
      status: 'pending',
      requested_by: payload.requestedBy,
      reason: payload.reason
    });

    const ncount = await Notification.count();
    await Notification.create({
      id: nextId('NOT', ncount + 1),
      type: 'transfer-request',
      title: 'Transfer Request',
      message: `Transfer request from ${payload.fromBranchId} to ${payload.toBranchId} for ${payload.unitIds.length} units.`,
      branch_id: payload.toBranchId,
      is_read: false,
      priority: 'high'
    });

    res.status(201).json(toDto(transfer));
  } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const t = await BranchTransfer.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Transfer not found' });
    res.json(toDto(t));
  } catch (e) { next(e); }
}

const approveSchema = z.object({ approvedBy: z.string().min(1) });

async function approve(req, res, next) {
  try {
    const t = await BranchTransfer.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Transfer not found' });
    const { approvedBy } = validate(approveSchema, req.body);

    t.status = 'approved';
    t.approved_by = approvedBy;
    await t.save();
    res.json(toDto(t));
  } catch (e) { next(e); }
}

async function ship(req, res, next) {
  try {
    const t = await BranchTransfer.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Transfer not found' });
    if (t.status !== 'approved') {
      const err = new Error('Transfer must be approved before shipping');
      err.status = 400;
      throw err;
    }

    // mark units in-transit
    const unitIds = t.unit_ids || [];
    const units = await BloodUnit.findAll({ where: { id: unitIds }});
    for (const u of units) {
      u.status = 'in-transit';
      await u.save();
    }

    t.status = 'in-transit';
    await t.save();
    res.json(toDto(t));
  } catch (e) { next(e); }
}

async function complete(req, res, next) {
  try {
    const t = await BranchTransfer.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Transfer not found' });
    if (t.status !== 'in-transit') {
      const err = new Error('Transfer must be in-transit before completion');
      err.status = 400;
      throw err;
    }

    const unitIds = t.unit_ids || [];
    const units = await BloodUnit.findAll({ where: { id: unitIds }});
    for (const u of units) {
      u.branch_id = t.to_branch_id;
      u.status = 'available';
      await u.save();
    }

    t.status = 'completed';
    t.completed_at = new Date();
    await t.save();

    res.json(toDto(t));
  } catch (e) { next(e); }
}

async function cancel(req, res, next) {
  try {
    const t = await BranchTransfer.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Transfer not found' });

    t.status = 'cancelled';
    await t.save();

    // revert units if they were set in-transit
    const unitIds = t.unit_ids || [];
    const units = await BloodUnit.findAll({ where: { id: unitIds }});
    for (const u of units) {
      if (u.status === 'in-transit') {
        u.status = 'available';
        await u.save();
      }
    }

    res.json(toDto(t));
  } catch (e) { next(e); }
}

module.exports = { list, create, get, approve, ship, complete, cancel };
