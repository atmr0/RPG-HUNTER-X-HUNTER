<script>
  import { createEventDispatcher } from 'svelte';
  export let src = '';
  export let alt = '';
  export let id = '';
  export let cell = {};
  const dispatch = createEventDispatcher();

  // state
  let preview = src;
  let fileInput;
  let uploadBtn;
  let hoverTimer = null;
  let overlayVisible = false;
  export let hoverDelay = 1; // ms before showing overlay on hover, default 1ms for almost immediate

  // keep preview in sync with external src
  $: preview = src;

  // helper to format size values (number -> % or px, string pass-through)
  function fmtSize(v) {
    if (v === undefined || v === null || v === '') return null;
    if (typeof v === 'number') return v > 0 && v <= 100 ? v + '%' : v + 'px';
    return String(v);
  }

  $: imgWidth = fmtSize(cell?.width) ?? '100%';
  $: imgHeight = fmtSize(cell?.height) ?? 'auto';

  function showOverlaySoon() {
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => { overlayVisible = true; hoverTimer = null; }, hoverDelay);
  }
  function hideOverlay() { if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; } overlayVisible = false; }
  function focusShow() { overlayVisible = true; }
  function focusHide() { overlayVisible = false; }

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      preview = dataUrl;
      if (id) dispatch('change', { id, value: dataUrl });
      if (fileInput) fileInput.value = '';
      if (uploadBtn) uploadBtn.blur();
      overlayVisible = false;
    };
    reader.readAsDataURL(f);
  }
</script>

<div class="img-root" style="background: {cell?.style?.background ?? 'transparent'}; border-color: {cell?.style?.borderColor ?? 'inherit'}">
    <div class="img-frame" role="group" style="width: {imgWidth}; height: {imgHeight};" on:mouseenter={showOverlaySoon} on:mouseleave={hideOverlay} on:focusin={focusShow} on:focusout={focusHide} class:show-overlay={overlayVisible}>
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
  .img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f3f3f3; color:#777 }

  .img-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
  }

  .img-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.1);
    opacity: 0;
    transition: opacity .18s ease;
  }

  .img-upload {
    pointer-events: auto;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity .18s ease, transform .18s ease;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(0,0,0,0.66);
    color: #fff;
    border: none;
    z-index: 3;
  }

  /* combine overlay and focus state using :is() to reduce repetition */
  .img-frame:is(.show-overlay, :focus-within) .img-upload { opacity: 1; transform: translateY(0); }
  .img-frame:is(.show-overlay, :focus-within) .img-overlay::before { opacity: 1; }
  .img-frame:is(.show-overlay, :focus-within) img { filter: brightness(1) blur(2px); }

  /* mobile fallback */
  @media (hover: none) {
    .img-upload { opacity: 0.9 }
  }
</style>
