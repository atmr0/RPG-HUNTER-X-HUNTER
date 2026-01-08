<script>
  import { createEventDispatcher } from 'svelte';
  import FieldBase from './FieldBase.svelte';
  import { getValue, makeUid } from '../utils/values.js';

  export let cell;
  export let values = {};
  const dispatch = createEventDispatcher();

  const uid = makeUid('sel', cell.id);
  $: current = values[cell.id] ?? cell.value ?? (cell.options && cell.options[0]) ?? '';

  function onChange(e) {
    dispatch('change', { id: cell.id, value: e.target.value });
  }
</script>

<FieldBase {cell} uid={uid}>
  <select id={uid} value={current} on:change={onChange}>
    {#each cell.options || [] as opt}
      <option value={opt} selected={opt === current}>{opt}</option>
    {/each}
  </select>
</FieldBase>
