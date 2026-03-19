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


export function toggleOutlineRed(element, enabled) {
    if (enabled)
        element.classList.add('outline-red-400');
    else
        element.classList.remove('outline-red-400');
}
