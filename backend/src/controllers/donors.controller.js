const { z } = require('zod');
const { validate } = require('../utils/validate');
const { Donor } = require('../models');
const { nextId } = require('../utils/id');

const donorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  dateOfBirth: z.string().min(4), // YYYY-MM-DD
  bloodGroup: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-']),
  address: z.string().min(1),
  eligibility: z.enum(['eligible','temporarily-deferred','permanently-deferred']).optional(),
  deferralReason: z.string().optional(),
  deferralEndDate: z.string().optional(),
  totalDonations: z.number().int().optional(),
  lastDonationDate: z.string().optional(),
  registeredAt: z.string().optional(),
  branchId: z.string().min(1)
});

function toDto(d) {
  return {
    id: d.id,
    firstName: d.first_name,
    lastName: d.last_name,
    email: d.email,
    phone: d.phone,
    dateOfBirth: new Date(d.date_of_birth),
    bloodGroup: d.blood_group,
    address: d.address,
    eligibility: d.eligibility,
    deferralReason: d.deferral_reason || undefined,
    deferralEndDate: d.deferral_end_date ? new Date(d.deferral_end_date) : undefined,
    totalDonations: d.total_donations,
    lastDonationDate: d.last_donation_date ? new Date(d.last_donation_date) : undefined,
    registeredAt: new Date(d.registered_at),
    branchId: d.branch_id
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.branchId) where.branch_id = String(req.query.branchId);
    if (req.query.bloodGroup) where.blood_group = String(req.query.bloodGroup);
    const items = await Donor.findAll({ where, order: [['id','ASC']] });
    res.json(items.map(toDto));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const payload = validate(donorSchema, req.body);
    const count = await Donor.count();
    const id = nextId('DON', count + 1);

    const donor = await Donor.create({
      id,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      date_of_birth: payload.dateOfBirth,
      blood_group: payload.bloodGroup,
      address: payload.address,
      eligibility: payload.eligibility || 'eligible',
      deferral_reason: payload.deferralReason || null,
      deferral_end_date: payload.deferralEndDate || null,
      total_donations: payload.totalDonations ?? 0,
      last_donation_date: payload.lastDonationDate || null,
      registered_at: payload.registeredAt ? new Date(payload.registeredAt) : new Date(),
      branch_id: payload.branchId
    });
    res.status(201).json(toDto(donor));
  } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    res.json(toDto(donor));
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const payload = validate(donorSchema.partial(), req.body);
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });

    if (payload.firstName !== undefined) donor.first_name = payload.firstName;
    if (payload.lastName !== undefined) donor.last_name = payload.lastName;
    if (payload.email !== undefined) donor.email = payload.email;
    if (payload.phone !== undefined) donor.phone = payload.phone;
    if (payload.dateOfBirth !== undefined) donor.date_of_birth = payload.dateOfBirth;
    if (payload.bloodGroup !== undefined) donor.blood_group = payload.bloodGroup;
    if (payload.address !== undefined) donor.address = payload.address;
    if (payload.eligibility !== undefined) donor.eligibility = payload.eligibility;
    if (payload.deferralReason !== undefined) donor.deferral_reason = payload.deferralReason || null;
    if (payload.deferralEndDate !== undefined) donor.deferral_end_date = payload.deferralEndDate || null;
    if (payload.totalDonations !== undefined) donor.total_donations = payload.totalDonations;
    if (payload.lastDonationDate !== undefined) donor.last_donation_date = payload.lastDonationDate || null;
    if (payload.registeredAt !== undefined) donor.registered_at = new Date(payload.registeredAt);
    if (payload.branchId !== undefined) donor.branch_id = payload.branchId;

    await donor.save();
    res.json(toDto(donor));
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    await donor.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { list, create, get, update, remove };
