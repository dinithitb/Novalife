const { Notification } = require('../models');

function toDto(n) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    branchId: n.branch_id || undefined,
    userId: n.user_id || undefined,
    isRead: n.is_read,
    priority: n.priority,
    createdAt: n.created_at
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.branchId) where.branch_id = String(req.query.branchId);
    if (req.query.userId) where.user_id = String(req.query.userId);
    if (req.query.isRead !== undefined) where.is_read = String(req.query.isRead) === 'true';
    const items = await Notification.findAll({ where, order: [['created_at','DESC']] });
    res.json(items.map(toDto));
  } catch (e) { next(e); }
}

async function markRead(req, res, next) {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) return res.status(404).json({ error: 'Notification not found' });
    n.is_read = true;
    await n.save();
    res.json(toDto(n));
  } catch (e) { next(e); }
}

module.exports = { list, markRead };
