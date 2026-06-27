export function groupBy(array, keyFn) {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {});
}

export function countBy(array, keyFn) {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

export function topN(object, n) {
  const entries = Object.entries(object);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, n).reduce((obj, [k, v]) => {
    obj[k] = v;
    return obj;
  }, {});
}

export function percentageOf(part, whole) {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

export function sumBy(array, keyFn) {
  return array.reduce((sum, item) => sum + (keyFn(item) || 0), 0);
}
