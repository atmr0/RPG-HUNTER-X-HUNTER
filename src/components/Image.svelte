<script>
  import { createEventDispatcher } from 'svelte';
  export let src = '';
  export let alt = '';
  export let id = '';
  export let cell = {};
  const dispatch = createEventDispatcher();

  let preview = src;
  let fileInput;

  $: preview = src;

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      preview = dataUrl;
      if (id) dispatch('change', { id, value: dataUrl });
    };
    reader.readAsDataURL(f);
  }
</script>

<div class="img-root" style="background: {cell?.style?.background ?? 'transparent'}; border-color: {cell?.style?.borderColor ?? 'inherit'}">
  {#if preview}
    <img src={preview} alt={alt} />
  {:else}
    <div class="img-placeholder">Sem imagem</div>
  {/if}
  <div class="img-actions">
    <input bind:this={fileInput} type="file" accept="image/*" on:change={onFile} style="display:none" />
    <button type="button" on:click={() => fileInput && fileInput.click()}>Upload</button>
  </div>
</div>

<style>
  .img-root { display:inline-block }
  .img-root img { max-width:100%; height:auto; display:block; border-radius:4px }
  .img-placeholder { width:100px; height:100px; display:flex; align-items:center; justify-content:center; background:#f3f3f3; color:#777; border-radius:4px }
  .img-actions { margin-top:6px; display:flex; justify-content:flex-end }
  .img-actions button { padding:4px 6px; border-radius:4px; font-size:12px; line-height:1; min-width:48px }
</style>
