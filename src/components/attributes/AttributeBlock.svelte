<script>
  import { createEventDispatcher } from 'svelte';
  import { ATTRIBUTE_COLORS, COLORS } from '../theme.js';
  export let attr;
  export let value = '';
  export let mod = null;
  // optional override — if provided, that color is used
  export let focusColor = '';
  const dispatch = createEventDispatcher();

  const uid = `attr-${attr.id}-${Math.random().toString(36).slice(2,7)}`;

  function onInput(e) {
    const v = e.target.value === '' ? '' : Number(e.target.value);
    dispatch('change', { id: attr.id, value: v });
  }

  function colorFromId(id) {
    if (!id) return COLORS.attributeFocus || 'black';
    const key = String(id).toUpperCase();

    return ATTRIBUTE_COLORS[key] ?? 'black';
  }

  $: computedFocus = focusColor || colorFromId(attr?.id || '');
</script>

<div class="attr-block-root" style="--color-attributeFocus: {computedFocus}">
  <div class="attr-label">{attr.label}</div>
  <div class="big-value">
    <input id={uid} class="attr-input" type="number" value={value ?? ''} on:input={onInput} />
  </div>
  <div class="attr-mod">{#if mod !== undefined && mod !== null}{mod >= 0 ? '+' + mod : String(mod)}{:else}&nbsp;{/if}</div>
</div>

<style>
  .attr-block-root { text-align:center; font-family: var(--font-base); color: var(--color-text) }
  .attr-label { margin-top:6px; font-size:var(--font-small); color: var(--color-muted) }

  .big-value {
    display:flex; align-items:center; justify-content:center;
    width: var(--size-attrCircle); height: var(--size-attrCircle);
    border-radius:50%; background: var(--color-background);
    border: calc(var(--input-borderWidth) * 2) solid var(--input-borderColor);
    margin:0 auto; box-sizing:border-box;
    transition: box-shadow .12s ease, border-color .12s ease;
  }

  /* crisp circular focus ring on the container */
  .big-value:focus-within {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-attributeFocus, #000);
    border-color: var(--color-attributeFocus, #000);
  }

  .attr-input {
    width: var(--size-attrCircleInner); height: var(--size-attrCircleInner);
    border-radius:50%; border:none; text-align:center; font-size:20px;
    background:transparent; box-sizing:border-box; color: var(--attribute_colors-focus, var(--color-text));
    caret-color: var(--color-text);
  }

  .attr-input:focus { outline: none; }
  .attr-input::-webkit-outer-spin-button, .attr-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0 }
  .attr-input { -moz-appearance: textfield }

  .attr-mod { margin-top:2px; font-size:14px; color: var(--color-text) }
</style>
