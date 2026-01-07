<script>
  import { createEventDispatcher } from 'svelte';
  export let cell;
  export let values = {};
  const dispatch = createEventDispatcher();

  const uid = `field-${cell.id}-${Math.random().toString(36).slice(2,7)}`;
  function getValue() {
    return values[cell.id] ?? '';
  }

  function onInput(e) {
    const raw = e.target.value;
    const value = cell.fieldType === 'number' ? (raw === '' ? '' : Number(raw)) : raw;
    dispatch('change', { id: cell.id, value });
  }
</script>

<div class="field-root">
  {#if cell.label}
    <label class="field-label" for={uid}>{cell.label}</label>
  {/if}
  {#if cell.fieldType === 'textarea'}
    <textarea id={uid} rows="3" on:input={onInput}>{getValue()}</textarea>
  {:else}
    <input id={uid} type={cell.fieldType === 'number' ? 'number' : 'text'} value={getValue()} on:input={onInput} />
  {/if}
</div>

<style>
  .field-root { display:flex; flex-direction:column; font-family: var(--font-base); }
  .field-label { font-size: var(--font-small); color: var(--color-muted); margin-bottom:4px }
  input, textarea {
    width:100%; box-sizing:border-box;
    padding: var(--input-padding);
    border: var(--input-borderWidth) solid var(--input-borderColor);
    border-radius: var(--radius-small);
    background: var(--color-background);
    color: var(--color-text);
  }
</style>
