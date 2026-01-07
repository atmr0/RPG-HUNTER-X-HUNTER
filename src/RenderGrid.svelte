<script>
  import { createEventDispatcher } from 'svelte';
  import Field from './components/Field.svelte';
  import Computed from './components/Computed.svelte';
  import Submatrix from './components/Submatrix.svelte';
  import Static from './components/Static.svelte';
  import Image from './components/Image.svelte';

  export let sheet;
  export let values = {};
  const dispatch = createEventDispatcher();

  function getCellValue(id) {
    return values[id] ?? '';
  }

  function emitChange(id, rawValue, fieldType) {
    const value = fieldType === 'number' ? (rawValue === '' ? '' : Number(rawValue)) : rawValue;
    dispatch('change', { id, value });
  }

  // computed values cache
  let computed = {};

  function safeCompute(expr) {
    if (!expr) return '';
    let s = String(expr);
    // find identifiers (variables)
    const ids = s.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
    const uniq = [...new Set(ids)];
    for (const id of uniq) {
      // replace identifier with numeric value (or 0)
      const raw = values[id];
      const num = raw === undefined || raw === null || raw === '' ? 0 : Number(raw);
      s = s.replace(new RegExp('\\b' + id + '\\b', 'g'), String(isNaN(num) ? 0 : num));
    }
    // allow only numbers, operators, dots, parentheses and spaces
    if (!/^[-+*\/()%.\d\s]+$/.test(s)) return null;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('return (' + s + ')');
      return fn();
    } catch (e) {
      return null;
    }
  }

  // recompute computed fields whenever `values` or `sheet` change
  $: if (sheet) {
    const next = {};
    for (const row of sheet.cells || []) {
      for (const cell of row || []) {
        if (!cell) continue;
        if (cell.type === 'computed') {
          const v = safeCompute(cell.expr);
          next[cell.id] = v;
          if (values[cell.id] !== v) dispatch('change', { id: cell.id, value: v });
        }
        if (cell.type === 'submatrix') {
          for (const subrow of cell.cells || []) {
            for (const subcell of subrow || []) {
              if (!subcell) continue;
              if (subcell.type === 'computed') {
                const v2 = safeCompute(subcell.expr);
                next[subcell.id] = v2;
                if (values[subcell.id] !== v2) dispatch('change', { id: subcell.id, value: v2 });
              }
            }
          }
        }
      }
    }
    computed = next;
  }
</script>

{#if sheet}
  <div class="grid" style="grid-template-columns: repeat({sheet.cols}, 1fr);">
    {#each sheet.cells as row, rindex}
      {#each row as cell, cindex}
        {#if cell}
          <div class="cell" style="grid-column: span {cell.colspan ?? 1}; grid-row: span {cell.rowspan ?? 1};">
            {#if cell.type === 'field'}
              <Field {cell} {values} on:change={(e) => dispatch('change', e.detail)} />
            {:else if cell.type === 'computed'}
              <Computed id={cell.id} label={cell.label} value={computed[cell.id]} />
            {:else if cell.type === 'submatrix'}
              <Submatrix {cell} {values} {computed} on:change={(e) => dispatch('change', e.detail)} />
            {:else if cell.type === 'static'}
              <Static text={cell.text} />
            {:else if cell.type === 'image'}
              <Image src={cell.src} alt={cell.alt} />
            {:else}
              <div>Tipo não suportado: {cell.type}</div>
            {/if}
          </div>
        {/if}
      {/each}
    {/each}
  </div>
{/if}

<style>
  .grid { display: grid; gap: 8px; }
  .cell { background:#f8f8f8; padding:8px; border:1px solid #e0e0e0; }
  /* styles for generic grid and cell only; field-specific styles moved to components */
</style>
