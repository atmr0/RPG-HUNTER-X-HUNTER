<script>
  import { createEventDispatcher } from 'svelte';
  export let attr;
  export let value = '';
  export let mod = null;
  const dispatch = createEventDispatcher();

  const uid = `attr-${attr.id}-${Math.random().toString(36).slice(2,7)}`;

  function onInput(e) {
    const v = e.target.value === '' ? '' : Number(e.target.value);
    dispatch('change', { id: attr.id, value: v });
  }
</script>

<div class="attr-block-root">
  <div class="attr-label">{attr.label}</div>
  <div class="big-value">
    <input id={uid} class="attr-input" type="number" value={value ?? ''} on:input={onInput} />
  </div>
  <div class="attr-mod">{#if mod !== undefined && mod !== null}{mod >= 0 ? '+' + mod : String(mod)}{:else}&nbsp;{/if}</div>
</div>

<style>
  .attr-block-root { text-align:center }
  .big-value { display:flex; align-items:center; justify-content:center; width:72px; height:72px; border-radius:50%; background:#fff; border:2px solid #ccc; margin:0 auto }
  .attr-input { width:64px; height:64px; border-radius:50%; border:none; text-align:center; font-size:20px; background:transparent }
  .attr-input::-webkit-outer-spin-button, .attr-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0 }
  .attr-input { -moz-appearance: textfield }
  .attr-label { margin-top:6px; font-size:12px }
  .attr-mod { margin-top:2px; font-size:14px; color:#333 }
</style>
