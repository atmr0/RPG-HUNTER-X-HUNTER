// Lightweight SheetBuilder helper to construct sheet objects in code
export class SheetBuilder {
  constructor({ title = '', id = '', description = '', cols = 6, rows = 0 } = {}) {
    this.sheet = {
      title,
      id,
      description,
      rows,
      cols,
      cells: []
    };
  }

  // push a raw row (array of cells or null placeholders)
  addRow(cells) {
    const row = (cells || []).map(c => unwrap(c));
    this.sheet.cells.push(row);
    return this;
  }

  // convenience builders for cell types
  field(opts) {
    const base = (typeof opts === 'string') ? { id: opts } : (opts || {});
    return new CellBuilder('field', base);
  }

  computed(opts) {
    const base = (typeof opts === 'string') ? { id: opts } : (opts || {});
    return new CellBuilder('computed', base);
  }

  submatrix(opts) {
    const base = (typeof opts === 'string') ? { id: opts } : (opts || {});
    return new CellBuilder('submatrix', base);
  }

  image(opts) {
    const base = (typeof opts === 'string') ? { id: opts } : (opts || {});
    return new CellBuilder('image', base);
  }

  static(text, opts = {}) {
    // allow b.static('Title').colspan(2)
    const base = (typeof text === 'object') ? text : { text };
    const merged = { ...(opts || {}), ...(typeof text === 'object' ? {} : {}) };
    return new CellBuilder('static', { ...base, ...merged, ...opts });
  }

  list(opts) {
    const base = (typeof opts === 'string') ? { id: opts } : (opts || {});
    return new CellBuilder('list', base);
  }

  // convenience to create a row of attributes + computed modifiers
  // attrs: array of strings or { id, label, value, fieldType }
  // opts: { id, label, colspan, modPrefix, modLabel }
  characterAttributes(attrs, opts = {}) {
    const list = Array.isArray(attrs) ? attrs : [];
    const cols = list.length || 1;
    const cells = [[], []];
    for (const a of list) {
      const item = typeof a === 'string' ? { id: a } : (a || {});
      const id = item.id;
      const label = item.label || id;
      const val = item.value;
      const ftype = item.fieldType || 'number';
      cells[0].push(this.field(id).fieldType(ftype).label(label).value(val));
      const modId = (opts.modPrefix || 'mod_') + id;
      const modLabel = opts.modLabel || 'Mod';
      const expr = `Math.floor((${id}-10)/2)`;
      cells[1].push(this.computed(modId).label(modLabel).expr(expr));
    }
    const base = {
      id: opts.id || 'attributes',
      label: opts.label || '',
      rows: 2,
      cols,
      colspan: opts.colspan || cols,
      cells
    };
    return this.submatrix(base);
  }

  checkbox(opts) { const base = (typeof opts === 'string') ? { id: opts } : (opts || {}); return new CellBuilder('checkbox', base); }
  select(opts) { const base = (typeof opts === 'string') ? { id: opts } : (opts || {}); return new CellBuilder('select', base); }

  build() {
    return this.sheet;
  }
}

export default SheetBuilder;

// Chainable wrapper for a single cell so callers can set presentation details
export class CellBuilder {
  constructor(type, base = {}) {
    this.cell = { type, ...(base || {}) };
  }

  // generic setter
  set(key, value) { this.cell[key] = value; return this; }

  // common sugar
  background(color) { this.cell.style = { ...(this.cell.style || {}), background: color }; return this; }
  border(color) { this.cell.style = { ...(this.cell.style || {}), borderColor: color }; return this; }
  cssClass(name) { this.cell.class = [this.cell.class, name].filter(Boolean).join(' '); return this; }
  colspan(n) { this.cell.colspan = n; return this; }
  rowspan(n) { this.cell.rowspan = n; return this; }
  id(v) { this.cell.id = v; return this; }
  label(v) { this.cell.label = v; return this; }

  // more specific setters useful for various cell types
  itemTemplate(arr) { this.cell.itemTemplate = arr; return this; }
  items(arr) { this.cell.items = arr; return this; }
  width(w) { this.cell.width = w; return this; }
  height(h) { this.cell.height = h; return this; }
  value(v) { this.cell.value = v; return this; }
  expr(e) { this.cell.expr = e; return this; }
  options(arr) { this.cell.options = arr; return this; }
  text(t) { this.cell.text = t; return this; }
  fieldType(ft) { this.cell.fieldType = ft; return this; }

  toObject() { return unwrap(this.cell); }
  toJSON() { return unwrap(this.cell); }
}

// Recursively convert any CellBuilder (or objects containing them) into plain objects
function unwrap(value) {
  if (value && typeof value.toObject === 'function') return unwrap(value.toObject());
  if (Array.isArray(value)) return value.map(unwrap);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = unwrap(value[k]);
    }
    return out;
  }
  return value;
}
