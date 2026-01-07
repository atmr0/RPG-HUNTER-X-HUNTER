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

<div class="list-root">
  <div class="list-label">{cell.label}</div>
  <div class="items">
    {#each items as item, i}
      <div class="item-row">
        {#each cell.itemTemplate || [] as tpl}
          <div class="item-field">
            <label class="field-label">{tpl.label ?? tpl.id}</label>
            {#if tpl.fieldType === 'number'}
              <input type="number" value={item[tpl.id] ?? ''} on:input={(e) => onFieldChange(i, tpl.id, e.target.value === '' ? '' : Number(e.target.value))} />
            {:else if tpl.fieldType === 'textarea'}
              <textarea on:input={(e) => onFieldChange(i, tpl.id, e.target.value)}>{item[tpl.id] ?? ''}</textarea>
            {:else}
              <input type="text" value={item[tpl.id] ?? ''} on:input={(e) => onFieldChange(i, tpl.id, e.target.value)} />
            {/if}
          </div>
        {/each}
        <button type="button" on:click={() => removeItem(i)}>Remover</button>
      </div>
    {/each}
  </div>
  <div class="list-actions">
    <button type="button" on:click={addItem}>Adicionar</button>
  </div>
</div>

<style>
  .list-root { display:block; }
  .list-label { font-weight:600; margin-bottom:6px }
  .item-row { display:flex; gap:8px; align-items:flex-end; margin-bottom:8px }
  .item-field { display:flex; flex-direction:column; min-width:120px }
  .field-label { font-size:12px; color:#444; margin-bottom:4px }
  input, textarea { width:100%; box-sizing:border-box }
  .list-actions { margin-top:8px }
</style>
