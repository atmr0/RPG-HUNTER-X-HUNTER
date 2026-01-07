<script>
  import { createEventDispatcher } from 'svelte';
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
</script>

{#if sheet}
  <div class="grid" style="grid-template-columns: repeat({sheet.cols}, 1fr);">
    {#each sheet.cells as row, rindex}
      {#each row as cell, cindex}
        {#if cell}
          <div class="cell" style="grid-column: span {cell.colspan ?? 1}; grid-row: span {cell.rowspan ?? 1};">
            {#if cell.type === 'field'}
              {@const id = `field-${cell.id}-${rindex}-${cindex}`}
              <label class="field-label" for={id}>{cell.id}</label>
              {#if cell.fieldType === 'textarea'}
                <textarea id={id} rows="4" bind:value={values[cell.id]} on:input={(e) => emitChange(cell.id, e.target.value, 'textarea')}></textarea>
              {:else}
                <input id={id} type={cell.fieldType === 'number' ? 'number' : 'text'} value={getCellValue(cell.id)} on:input={(e) => emitChange(cell.id, e.target.value, cell.fieldType)} />
              {/if}
            {:else if cell.type === 'submatrix'}
              <div class="submatrix">
                <div class="grid" style="grid-template-columns: repeat({cell.cols}, 1fr);">
                  {#each cell.cells as subrow, srindex}
                    {#each subrow as subcell, scindex}
                      {#if subcell}
                        <div class="cell sub" style="grid-column: span {subcell.colspan ?? 1}; grid-row: span {subcell.rowspan ?? 1};">
                          {#if subcell.type === 'field'}
                            {@const sid = `field-${subcell.id}-${rindex}-${cindex}-${srindex}-${scindex}`}
                            <label class="field-label" for={sid}>{subcell.id}</label>
                            {#if subcell.fieldType === 'textarea'}
                              <textarea id={sid} rows="3" bind:value={values[subcell.id]} on:input={(e) => emitChange(subcell.id, e.target.value, 'textarea')}></textarea>
                            {:else}
                              <input id={sid} type={subcell.fieldType === 'number' ? 'number' : 'text'} value={getCellValue(subcell.id)} on:input={(e) => emitChange(subcell.id, e.target.value, subcell.fieldType)} />
                            {/if}
                          {:else}
                            <div>Submatrix</div>
                          {/if}
                        </div>
                      {/if}
                    {/each}
                  {/each}
                </div>
              </div>
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
  .field-label { font-size:12px; color:#444 }
  input, textarea { width:100%; box-sizing:border-box }
  .submatrix { padding:4px; background:#fff }
  .cell.sub { background:#fffbe6 }
</style>
