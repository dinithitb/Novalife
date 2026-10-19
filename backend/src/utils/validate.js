function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = new Error(result.error.issues.map(i => i.message).join(', '));
    error.status = 400;
    throw error;
  }
  return result.data;
}
module.exports = { validate };
