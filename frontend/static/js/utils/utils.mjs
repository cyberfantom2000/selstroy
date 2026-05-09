export function isEmpty(val) {
  if (typeof val === 'string')
    return val.trim().length === 0;

  if (Array.isArray(val))
    return val.length === 0;

  if (val instanceof Map || val instanceof Set)
    return val.size === 0;

  throw new Error('Unsupported type in isEmpty');
}


export function isNumber(value) {
  return !isEmpty(value) && !Number.isNaN(Number(value));
}


export function isIntegerNumber(value) {
  return isNumber(value) && Number.isInteger(Number(value));
}


export function toggleOutlineRed(element, enabled) {
  if (enabled)
    element.classList.add('outline-red-400');
  else
    element.classList.remove('outline-red-400');
}

export function pretifyCost(value) {
    const formats = [
        { divider: 1_000_000_000, suffix: 'млрд' },
        { divider: 1_000_000, suffix: 'млн' },
        { divider: 1_000, suffix: 'тыс' },
    ];

    for (const { divider, suffix } of formats) {
        if (value >= divider) {
            const num = value / divider;
            const rounded = Math.ceil(num * 1000) / 1000;
            return `${Number(rounded.toFixed(3))} ${suffix}`;
        }
    }

    return String(value);
}