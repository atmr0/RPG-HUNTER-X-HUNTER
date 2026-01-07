<script>
  import { createEventDispatcher } from 'svelte';
  export let cell;
  export let values = {};
  const dispatch = createEventDispatcher();

  const uid = `chk-${cell.id}-${Math.random().toString(36).slice(2,7)}`;

  $: checked = Boolean(values[cell.id] ?? cell.value ?? false);

  function onChange(e) {
    dispatch('change', { id: cell.id, value: e.target.checked });
  }
</script>

<div class="checkbox-root">
  <label for={uid}>
    <input id={uid} type="checkbox" checked={checked} on:change={onChange} />
    <span>{cell.label ?? cell.id}</span>
  </label>
</div>

<style>
  .checkbox-root label { display:inline-flex; align-items:center; gap:8px }
</style>
