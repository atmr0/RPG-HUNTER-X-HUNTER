<script>
  import { createEventDispatcher } from 'svelte';
  export let cell;
  export let values = {};
  const dispatch = createEventDispatcher();

  const uid = `sel-${cell.id}-${Math.random().toString(36).slice(2,7)}`;
  $: value = values[cell.id] ?? cell.value ?? (cell.options && cell.options[0]) ?? '';

  function onChange(e) {
    dispatch('change', { id: cell.id, value: e.target.value });
  }
</script>

<div class="select-root">
  {#if cell.label}
    <label class="field-label" for={uid}>{cell.label}</label>
  {/if}
  <select id={uid} value={value} on:change={onChange}>
    {#each cell.options || [] as opt}
      <option value={opt} selected={opt === value}>{opt}</option>
    {/each}
  </select>
</div>

<style>
  .select-root { display:flex; flex-direction:column }
  .field-label { font-size:12px; color:#444; margin-bottom:4px }
  select { width:100%; box-sizing:border-box }
</style>
