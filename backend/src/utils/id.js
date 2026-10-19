function nextId(prefix, n) {
  const s = String(n).padStart(3, '0');
  return `${prefix}${s}`;
}

module.exports = { nextId };
