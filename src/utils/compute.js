import { Parser } from 'expr-eval';

export function evaluateExpression(expr, values = {}) {
  if (!expr) return '';
  try {
    const parser = new Parser();
    const parsed = parser.parse(String(expr));
    const scope = {};
    for (const [k, v] of Object.entries(values || {})) {
      const num = v === '' || v === null || v === undefined ? 0 : Number(v);
      scope[k] = isNaN(num) ? 0 : num;
    }
    // allow access to Math functions if expression uses them
    scope.Math = Math;
    return parsed.evaluate(scope);
  } catch (e) {
    return null;
  }
}
