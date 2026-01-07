<script>
  import Field from './Field.svelte';
  import Computed from './Computed.svelte';
  import Checkbox from './Checkbox.svelte';
  import Select from './Select.svelte';
  import Separator from './Separator.svelte';
  import List from './List.svelte';
  import AttributeBlock from './attributes/AttributeBlock.svelte';
  import { createEventDispatcher } from 'svelte';

  export let cell;
  export let values = {};
  export let computed = {};
  const dispatch = createEventDispatcher();

  function onChildChange(e) {
    dispatch('change', e.detail);
  }
</script>

<div class="submatrix-root">
  <div class="submatrix-label">{cell.label}</div>
  {#if cell.id === 'attributes'}
    <div class="attributes-grid">
      {#each cell.cells[0] as attr, aindex}
        <AttributeBlock attr={attr} value={values[attr.id]} mod={computed ? computed[`mod_${attr.id}`] : null} on:change={(e) => dispatch('change', e.detail)} />
      {/each}
    </div>
  {:else}
    <div class="grid" style="grid-template-columns: repeat({cell.cols}, 1fr);">
      {#each cell.cells as subrow, srindex}
        {#each subrow as subcell, scindex}
          {#if subcell}
            <div class="cell sub" style="grid-column: span {subcell.colspan ?? 1}; grid-row: span {subcell.rowspan ?? 1};">
              {#if subcell.type === 'field'}
                <Field cell={subcell} {values} on:change={onChildChange} />
              {:else if subcell.type === 'computed'}
                <Computed id={subcell.id} label={subcell.label} value={computed[subcell.id]} />
              {:else if subcell.type === 'checkbox'}
                <Checkbox cell={subcell} {values} on:change={onChildChange} />
              {:else if subcell.type === 'select'}
                <Select cell={subcell} {values} on:change={onChildChange} />
              {:else if subcell.type === 'separator'}
                <Separator colspan={subcell.colspan ?? 1} />
              {:else if subcell.type === 'list'}
                <List cell={subcell} {values} on:change={onChildChange} />
              {:else}
                <div>Tipo não suportado</div>
              {/if}
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .submatrix-root { padding:4px; }
  .submatrix-label { font-weight:600; margin-bottom:6px }
  .grid { display:grid; gap:6px }
  .cell.sub { background:#eaeaea; padding:6px; border:1px solid #eee }

  /* attributes container */
  .attributes-grid { display:grid; grid-template-columns: repeat(6,1fr); gap:10px; align-items:center }
</style>
