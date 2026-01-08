<script>
  import { createEventDispatcher } from 'svelte';
  export let src = '';
  export let alt = '';
  export let id = '';
  export let cell = {};
  const dispatch = createEventDispatcher();

  let preview = src;
  let fileInput;
  let uploadBtn;

  $: preview = src;
  
  // derive CSS size values from cell.width / cell.height
  function fmtSize(v) {
    if (v === undefined || v === null || v === '') return null;
    if (typeof v === 'number') return v > 0 && v <= 100 ? v + '%' : v + 'px';
    // if string, pass through (allow '30%' or '100px')
    return String(v);
  }

  $: imgWidth = fmtSize(cell?.width) ?? '100%';
  $: imgHeight = fmtSize(cell?.height) ?? 'auto';

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      preview = dataUrl;
      if (id) dispatch('change', { id, value: dataUrl });
      // clear file input and remove focus from upload button so overlay hides
      try {
        if (fileInput) fileInput.value = '';
        if (uploadBtn) uploadBtn.blur();
      } catch (e) {}
    };
    reader.readAsDataURL(f);
  }
</script>

<div class="img-root" style="background: {cell?.style?.background ?? 'transparent'}; border-color: {cell?.style?.borderColor ?? 'inherit'}">
  <div class="img-frame" style="width: {imgWidth}; height: {imgHeight};">
    {#if preview}
      <img src={preview} alt={alt} style="width:100%; height:100%; object-fit:contain; display:block;" />
    {:else}
      <div class="img-placeholder">Sem imagem</div>
    {/if}

    <!-- overlay button appears on hover or focus-within of the frame -->
    <div class="img-overlay">
      <button bind:this={uploadBtn} class="img-upload" type="button" aria-label="Upload" on:click={() => fileInput && fileInput.click()}>
        Upload
      </button>
    </div>
  </div>

  <!-- hidden file input (still reachable via button) -->
  <input bind:this={fileInput} type="file" accept="image/*" on:change={onFile} style="display:none" />
</div>

<style>
  .img-root { display:inline-block }
  .img-frame { position: relative; display:inline-block; overflow: hidden; border-radius:4px }
  .img-frame img { width:100%; height:100%; display:block; border-radius:4px; transition: filter .18s ease, transform .18s ease }
  .img-placeholder { width:100px; height:100px; display:flex; align-items:center; justify-content:center; background:#f3f3f3; color:#777; border-radius:4px }
  .img-actions { margin-top:6px; display:flex; justify-content:flex-end }
  .img-actions button { padding:4px 6px; border-radius:4px; font-size:12px; line-height:1; min-width:48px }

  .img-root { position: relative }
  .img-overlay { position: absolute; inset: 0; display:flex; align-items:center; justify-content:center; pointer-events: none; z-index: 2 }
  .img-overlay::before { content: ''; position:absolute; inset:0; background: rgba(0,0,0,0.28); opacity:0; transition: opacity .18s ease; pointer-events:none }
  .img-upload { pointer-events: auto; opacity: 0; transform: translateY(6px); transition: opacity .18s ease, transform .18s ease; padding:6px 10px; border-radius:6px; background: rgba(0,0,0,0.66); color: white; border: none; z-index:3 }
  .img-frame:hover .img-upload, .img-frame:focus-within .img-upload { opacity: 1; transform: translateY(0) }
  .img-frame:hover .img-overlay::before, .img-frame:focus-within .img-overlay::before { opacity: 1 }
  .img-frame:hover img, .img-frame:focus-within img { filter: brightness(0.5) blur(2px) }

  /* mobile fallback: always show a subtle icon area if no hover support */
  @media (hover: none) {
    .img-upload { opacity: 0.9 }
  }
</style>
