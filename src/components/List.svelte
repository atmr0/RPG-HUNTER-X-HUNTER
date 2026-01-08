<script>
  import { createEventDispatcher } from 'svelte';
  export let cell; // list definition: itemTemplate, items
  export let values = {};
  const dispatch = createEventDispatcher();

  // initialize from values[cell.id] (if present) or cell.items
  let items = Array.isArray(values[cell.id]) ? JSON.parse(JSON.stringify(values[cell.id])) : (Array.isArray(cell.items) ? JSON.parse(JSON.stringify(cell.items)) : []);

  function emitItems() {
    dispatch('change', { id: cell.id, value: items });
  }

  function addItem() {
    const tpl = cell.itemTemplate || [];
    const newItem = {};
    for (const f of tpl) {
      newItem[f.id || f.fieldId || 'field'] = f.value ?? '';
    }
    items = [...items, newItem];
    emitItems();
  }

  function removeItem(i) {
    items = items.slice(0,i).concat(items.slice(i+1));
    emitItems();
  }

  function onFieldChange(i, key, value) {
    items = items.map((it, idx) => idx === i ? ({ ...it, [key]: value }) : it);
    emitItems();
  }
</script>

<div class="list-root" style="background: {cell?.style?.background ?? 'transparent'}; border-color: {cell?.style?.borderColor ?? 'inherit'}">
  <div class="list-label">{cell.label}</div>
  <div class="items">
    {#each items as item, i}
      <div class="item-row">
        {#each cell.itemTemplate || [] as tpl}
          {@const uid = `${cell.id}-${i}-${tpl.id}`}
          <div class="item-field">
            {#if tpl.label}
              <label class="field-label" for={uid}>{tpl.label}</label>
            {/if}
            {#if tpl.fieldType === 'number'}
              <input id={uid} type="number" value={item[tpl.id] ?? ''} on:input={(e) => onFieldChange(i, tpl.id, e.target.value === '' ? '' : Number(e.target.value))} />
            {:else if tpl.fieldType === 'textarea'}
              <textarea id={uid} on:input={(e) => onFieldChange(i, tpl.id, e.target.value)}>{item[tpl.id] ?? ''}</textarea>
            {:else}
              <input id={uid} type="text" value={item[tpl.id] ?? ''} on:input={(e) => onFieldChange(i, tpl.id, e.target.value)} />
            {/if}
          </div>
        {/each}
        <button type="button" class="btn-remove" on:click={() => removeItem(i)}>Remover</button>
      </div>
    {/each}
  </div>
  <div class="list-actions">
    <button type="button" class="btn-add" on:click={addItem}>Adicionar</button>
  </div>
</div>

<style>
  .list-root { display:block; font-family: var(--font-base); }
  .list-label { font-weight:600; margin-bottom:6px; color: var(--color-text); font-size: var(--font-normal); }
  .item-row { display:flex; gap: var(--size-gap); align-items:flex-end; margin-bottom:8px }
  .item-field { display:flex; flex-direction:column; min-width:120px }
  .field-label { font-size: var(--font-small); color: var(--color-muted); margin-bottom:4px }
  input, textarea {
    width:100%; box-sizing:border-box;
    padding: var(--input-padding);
    border: var(--input-borderWidth) solid var(--input-borderColor);
    border-radius: var(--radius-small);
    background: var(--color-background);
    color: var(--color-text);
  }
  .list-actions { margin-top:8px }
  .btn-remove { background: var(--color-surface); color: var(--color-text); padding: var(--button-padding); border-radius: var(--button-radius); border: 1px solid var(--input-borderColor) }
  .btn-add { background: var(--button-bg); color: var(--button-color); padding: var(--button-padding); border-radius: var(--button-radius); border: none }
</style>
