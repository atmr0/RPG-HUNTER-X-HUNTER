<script>
  export let cell;
  export let uid;
</script>

<div class="field-root" style="background: {cell?.style?.background ?? 'transparent'}; border-color: {cell?.style?.borderColor ?? 'inherit'}">
  {#if cell?.label}
    <label class="field-label" for={uid}>{cell.label}</label>
  {/if}
  <div class="field-slot"><slot /></div>
</div>

<style>
  .field-root { display:flex; flex-direction:column; font-family: var(--font-base); }
  .field-label { font-size: var(--font-small); color: var(--color-muted); margin-bottom:4px }
  .field-slot :global(input), .field-slot :global(textarea), .field-slot :global(select) {
    width:100%; box-sizing:border-box;
    padding: var(--input-padding);
    border: var(--input-borderWidth) solid var(--input-borderColor);
    border-radius: var(--radius-small);
    background: var(--color-background);
    color: var(--color-text);
  }
</style>
