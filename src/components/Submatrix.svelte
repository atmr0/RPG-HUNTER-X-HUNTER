<script>
  import Field from './Field.svelte';
  import Computed from './Computed.svelte';
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
  <div class="grid" style="grid-template-columns: repeat({cell.cols}, 1fr);">
    {#each cell.cells as subrow, srindex}
      {#each subrow as subcell, scindex}
        {#if subcell}
          <div class="cell sub" style="grid-column: span {subcell.colspan ?? 1}; grid-row: span {subcell.rowspan ?? 1};">
            {#if subcell.type === 'field'}
              <Field cell={subcell} {values} on:change={onChildChange} />
            {:else if subcell.type === 'computed'}
              <Computed id={subcell.id} label={subcell.label} value={computed[subcell.id]} />
            {:else}
              <div>Tipo não suportado</div>
            {/if}
          </div>
        {/if}
      {/each}
    {/each}
  </div>
</div>

<style>
  .submatrix-root { padding:4px; background:#fff }
  .submatrix-label { font-weight:600; margin-bottom:6px }
  .grid { display:grid; gap:6px }
  .cell.sub { background:#fffbe6; padding:6px; border:1px solid #eee }
</style>
