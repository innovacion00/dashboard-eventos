/**
 * Returns the next sequential number for a document, using the highest
 * existing number as the base instead of countDocuments(). This prevents
 * collisions when documents are hard-deleted (e.g. via cleanup scripts).
 *
 * @param {Model} Model - Mongoose model
 * @param {string} prefix - e.g. 'COT-2026-'
 * @returns {Promise<number>} next sequence integer
 */
export async function nextSequence(Model, prefix) {
  const last = await Model.findOne(
    { number: { $regex: `^${prefix}` } },
    { number: 1 },
    { sort: { number: -1 } }
  );
  if (!last?.number) return 1;
  const seq = parseInt(last.number.slice(prefix.length), 10);
  return isNaN(seq) ? 1 : seq + 1;
}
