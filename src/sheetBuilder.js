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
    this.sheet.cells.push(cells || []);
    return this;
  }

  // convenience builders for cell types
  field(opts) {
    return { type: 'field', ...opts };
  }

  computed(opts) {
    return { type: 'computed', ...opts };
  }

  submatrix(opts) {
    return { type: 'submatrix', ...opts };
  }

  image(opts) {
    return { type: 'image', ...opts };
  }

  static(text, opts = {}) {
    return { type: 'static', text, ...opts };
  }

  list(opts) {
    return { type: 'list', ...opts };
  }

  checkbox(opts) { return { type: 'checkbox', ...opts }; }
  select(opts) { return { type: 'select', ...opts }; }

  build() {
    return this.sheet;
  }
}

export default SheetBuilder;
