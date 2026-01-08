<script>
  import { createEventDispatcher } from 'svelte';
  import FieldBase from './FieldBase.svelte';
  import { getValue, makeUid } from '../utils/values.js';

  export let cell;
  export let values = {};
  const dispatch = createEventDispatcher();

  const uid = makeUid('chk', cell.id);
  $: checked = Boolean(getValue(values, cell.id, cell.value ?? false));

  function onChange(e) {
    dispatch('change', { id: cell.id, value: e.target.checked });
  }
</script>

<FieldBase {cell} uid={uid}>
  {#if cell.label}
    <label for={uid} style="display:inline-flex; align-items:center; gap:8px">
      <input id={uid} type="checkbox" checked={checked} on:change={onChange} />
      <span>{cell.label}</span>
    </label>
  {:else}
    <input id={uid} type="checkbox" checked={checked} on:change={onChange} />
  {/if}
</FieldBase>
