const { AuditLog } = require('../models');

function toDto(a) {
  return {
    id: a.id,
    action: a.action,
    entityType: a.entity_type,
    entityId: a.entity_id,
    userId: a.user_id,
    details: a.details || {},
    timestamp: a.timestamp,
  };
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.entityType) where.entity_type = String(req.query.entityType);
    if (req.query.userId) where.user_id = String(req.query.userId);
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });
    res.json({ total: count, items: rows.map(toDto) });
  } catch (e) { next(e); }
}

module.exports = { list };
