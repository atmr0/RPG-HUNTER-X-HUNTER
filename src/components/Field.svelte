<script>
  import { createEventDispatcher } from 'svelte';
  import FieldBase from './FieldBase.svelte';
  import { getValue, toNumberOrEmpty, makeUid } from '../utils/values.js';

  export let cell;
  export let values = {};
  const dispatch = createEventDispatcher();

  const uid = makeUid('field', cell.id);

  function onInput(e) {
    const raw = e.target.value;
    const value = cell.fieldType === 'number' ? toNumberOrEmpty(raw) : raw;
    dispatch('change', { id: cell.id, value });
  }
</script>

<FieldBase {cell} uid={uid}>
  {#if cell.fieldType === 'textarea'}
    <textarea id={uid} rows="3" on:input={onInput}>{getValue(values, cell.id)}</textarea>
  {:else}
    <input id={uid} type={cell.fieldType === 'number' ? 'number' : 'text'} value={getValue(values, cell.id)} on:input={onInput} />
  {/if}
</FieldBase>
