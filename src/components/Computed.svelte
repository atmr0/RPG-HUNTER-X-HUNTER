<script>
  export let id;
  export let label;
  export let value;
  const uid = id ?? `computed-${Math.random().toString(36).slice(2,7)}`;
</script>

<div class="computed-root">
  <label class="field-label" for={uid}>{label ?? id}</label>
  <input id={uid} readonly type="text" value={value ?? ''} />
</div>

<style>
  .computed-root { display:flex; flex-direction:column; font-family: var(--font-base); }
  .field-label { font-size: var(--font-small); color: var(--color-muted); margin-bottom:4px }
  input {
    width:100%; box-sizing:border-box; background: var(--color-surface);
    padding: var(--input-padding);
    border: var(--input-borderWidth) solid var(--input-borderColor);
    border-radius: var(--radius-small);
    color: var(--color-text);
  }
</style>
