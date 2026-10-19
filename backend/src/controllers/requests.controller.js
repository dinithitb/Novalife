const { z } = require('zod');
const { validate } = require('../utils/validate');
const { HospitalRequest, BloodUnit, Notification } = require('../models');
const { nextId } = require('../utils/id');
const { sendEmail } = require('../services/email.service');

const reqSchema = z.object({
  hospitalName: z.string().min(1),
  contactPerson: z.string().min(1),
  contactPhone: z.string().min(1),
  bloodGroup: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-']),
  component: z.enum(['Whole Blood','Red Blood Cells','Platelets','Plasma','Cryoprecipitate']),
  quantity: z.number().int().positive(),
  urgency: z.enum(['routine','urgent','emergency']).optional(),
  status: z.enum(['pending','approved','fulfilled','partially-fulfilled','rejected']).optional(),
  branchId: z.string().min(1),
  requestedBy: z.string().min(1),
  allocatedUnits: z.array(z.string()).optional(),
  fulfilledQuantity: z.number().int().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional()
});

function toDto(r) {
  return {
    id: r.id,
    hospitalName: r.hospital_name,
    contactPerson: r.contact_person,
    contactPhone: r.contact_phone,
    bloodGroup: r.blood_group,
    component: r.component,
    quantity: r.quantity,
    urgency: r.urgency,
    status: r.status,
    branchId: r.branch_id,
    requestedBy: r.requested_by,
    allocatedUnits: r.allocated_units || undefined,
    fulfilledQuantity: r.fulfilled_quantity,
    rejectionReason: r.rejection_reason || undefined,
    notes: r.notes || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.branchId) where.branch_id = String(req.query.branchId);
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.urgency) where.urgency = String(req.query.urgency);
    const items = await HospitalRequest.findAll({ where, order: [['created_at','DESC']] });
    res.json(items.map(toDto));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const payload = validate(reqSchema, req.body);

    const count = await HospitalRequest.count();
    const id = nextId('REQ', count + 1);

    const record = await HospitalRequest.create({
      id,
      hospital_name: payload.hospitalName,
      contact_person: payload.contactPerson,
      contact_phone: payload.contactPhone,
      blood_group: payload.bloodGroup,
      component: payload.component,
      quantity: payload.quantity,
      urgency: payload.urgency || 'routine',
      status: payload.status || 'pending',
      branch_id: payload.branchId,
      requested_by: payload.requestedBy,
      allocated_units: payload.allocatedUnits || null,
      fulfilled_quantity: payload.fulfilledQuantity ?? 0,
      rejection_reason: payload.rejectionReason || null,
      notes: payload.notes || null
    });

    // notification for emergency
    if ((payload.urgency || 'routine') === 'emergency') {
      const ncount = await Notification.count();
      await Notification.create({
        id: nextId('NOT', ncount + 1),
        type: 'emergency-request',
        title: 'Emergency Blood Request',
        message: `${payload.hospitalName} needs ${payload.quantity} units of ${payload.bloodGroup} ${payload.component} urgently.`,
        branch_id: payload.branchId,
        is_read: false,
        priority: 'critical'
      });

      // optional email (requires SMTP config)
      await sendEmail({
        to: process.env.SMTP_USER || '',
        subject: 'Emergency Blood Request',
        text: `Emergency request: ${payload.hospitalName} needs ${payload.quantity} units of ${payload.bloodGroup} ${payload.component}.`
      }).catch(() => {});
    }

    res.status(201).json(toDto(record));
  } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const r = await HospitalRequest.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });
    res.json(toDto(r));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const payload = validate(reqSchema.partial(), req.body);
    const r = await HospitalRequest.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });

    if (payload.hospitalName !== undefined) r.hospital_name = payload.hospitalName;
    if (payload.contactPerson !== undefined) r.contact_person = payload.contactPerson;
    if (payload.contactPhone !== undefined) r.contact_phone = payload.contactPhone;
    if (payload.bloodGroup !== undefined) r.blood_group = payload.bloodGroup;
    if (payload.component !== undefined) r.component = payload.component;
    if (payload.quantity !== undefined) r.quantity = payload.quantity;
    if (payload.urgency !== undefined) r.urgency = payload.urgency;
    if (payload.status !== undefined) r.status = payload.status;
    if (payload.branchId !== undefined) r.branch_id = payload.branchId;
    if (payload.requestedBy !== undefined) r.requested_by = payload.requestedBy;
    if (payload.allocatedUnits !== undefined) r.allocated_units = payload.allocatedUnits || null;
    if (payload.fulfilledQuantity !== undefined) r.fulfilled_quantity = payload.fulfilledQuantity;
    if (payload.rejectionReason !== undefined) r.rejection_reason = payload.rejectionReason || null;
    if (payload.notes !== undefined) r.notes = payload.notes || null;

    await r.save();
    res.json(toDto(r));
  } catch (e) { next(e); }
}

const approveSchema = z.object({
  allocatedUnits: z.array(z.string()).min(1).optional()
});

async function approve(req, res, next) {
  try {
    const r = await HospitalRequest.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });
    const payload = validate(approveSchema, req.body || {});

    r.status = 'approved';

    if (payload.allocatedUnits?.length) {
      // reserve units
      const units = await BloodUnit.findAll({ where: { id: payload.allocatedUnits }});
      for (const u of units) {
        if (u.status !== 'available') continue;
        u.status = 'reserved';
        await u.save();
      }
      r.allocated_units = payload.allocatedUnits;
    }

    await r.save();

    res.json(toDto(r));
  } catch (e) { next(e); }
}

const rejectSchema = z.object({
  rejectionReason: z.string().min(1)
});

async function reject(req, res, next) {
  try {
    const r = await HospitalRequest.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });

    const payload = validate(rejectSchema, req.body);
    r.status = 'rejected';
    r.rejection_reason = payload.rejectionReason;
    await r.save();

    // unreserve units if any
    if (Array.isArray(r.allocated_units)) {
      const units = await BloodUnit.findAll({ where: { id: r.allocated_units }});
      for (const u of units) {
        if (u.status === 'reserved') {
          u.status = 'available';
          await u.save();
        }
      }
    }

    res.json(toDto(r));
  } catch (e) { next(e); }
}

const fulfillSchema = z.object({
  fulfilledQuantity: z.number().int().positive(),
  unitIds: z.array(z.string()).optional()
});

async function fulfill(req, res, next) {
  try {
    const r = await HospitalRequest.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });

    const payload = validate(fulfillSchema, req.body);

    r.fulfilled_quantity = payload.fulfilledQuantity;
    if (payload.fulfilledQuantity >= r.quantity) r.status = 'fulfilled';
    else r.status = 'partially-fulfilled';

    const unitIds = payload.unitIds || r.allocated_units || [];
    if (unitIds.length) {
      const units = await BloodUnit.findAll({ where: { id: unitIds }});
      for (const u of units) {
        if (u.status === 'reserved' || u.status === 'available') {
          u.status = 'issued';
          await u.save();
        }
      }
      r.allocated_units = unitIds;
    }

    await r.save();
    res.json(toDto(r));
  } catch (e) { next(e); }
}

module.exports = { list, create, get, update, approve, reject, fulfill };
