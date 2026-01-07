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
  .computed-root { display:flex; flex-direction:column }
  .field-label { font-size:12px; color:#444; margin-bottom:4px }
  input { width:100%; box-sizing:border-box; background:#f3f3f3 }
</style>
