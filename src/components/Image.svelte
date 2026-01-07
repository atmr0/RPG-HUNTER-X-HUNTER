<script>
  export let src = '';
  export let alt = '';
</script>

<div class="img-root">
  <img src={src} alt={alt} />
</div>

<style>
  .img-root img { max-width:100%; height:auto; display:block }
</style>
