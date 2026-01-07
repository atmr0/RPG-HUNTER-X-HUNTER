<script>
  export let sheet;
  export let values = {};

  function getCellValue(id) {
    return values[id] ?? '';
  }
</script>

{#if sheet}
  <div class="grid" style="grid-template-columns: repeat({sheet.cols}, 1fr);">
    {#each sheet.cells as row}
      {#each row as cell}
        {#if cell}
          <div class="cell" style="grid-column: span {cell.colspan ?? 1}; grid-row: span {cell.rowspan ?? 1};">
            {#if cell.type === 'field'}
              <label class="field-label">{cell.id}</label>
              {#if cell.fieldType === 'textarea'}
                <textarea readonly rows="4">{getCellValue(cell.id)}</textarea>
              {:else}
                <input readonly type={cell.fieldType === 'number' ? 'number' : 'text'} value={getCellValue(cell.id)} />
              {/if}
            {:else if cell.type === 'submatrix'}
              <div class="submatrix">
                <div class="grid" style="grid-template-columns: repeat({cell.cols}, 1fr);">
                  {#each cell.cells as subrow}
                    {#each subrow as subcell}
                      {#if subcell}
                        <div class="cell sub" style="grid-column: span {subcell.colspan ?? 1}; grid-row: span {subcell.rowspan ?? 1};">
                          {#if subcell.type === 'field'}
                            <label class="field-label">{subcell.id}</label>
                            {#if subcell.fieldType === 'textarea'}
                              <textarea readonly rows="3">{getCellValue(subcell.id)}</textarea>
                            {:else}
                              <input readonly type={subcell.fieldType === 'number' ? 'number' : 'text'} value={getCellValue(subcell.id)} />
                            {/if}
                          {:else}
                            <!-- nested submatrices beyond one level are rendered as plain blocks -->
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
