<script>
  export let text = '';
  export let cell = {};
</script>

<div class="static-root" style="background: {cell?.style?.background ?? 'transparent'}; border-color: {cell?.style?.borderColor ?? 'inherit'}">{text}</div>

<style>
  .static-root { font-weight:700; text-align:center; padding:8px }
</style>
