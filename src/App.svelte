<script>
  import { onMount } from 'svelte';
  import RenderGrid from './RenderGrid.svelte';
  // Import local JSON bundles so the bundler includes them in the output.
  // These imports will be inlined when we build the single-file HTML.
  import usersBundle from '../users.json';
  import sheetBundle from '../sheets/sheet1.json';
  import dataAnaBundle from '../data/ana_sheet1.json';

  let baseUrl = './';
  let username = '';
  let password = '';
  let error = '';
  let logged = false;
  let currentUser = null;
  let sheet = null;
  let values = {};

  function updateValue(id, value) {
    values = { ...values, [id]: value };
  }

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  }

  async function handleLogin() {
    error = '';
    try {
      const usersUrl = `${baseUrl}users.json`;
      const usersJson = usersBundle ?? await fetchJSON(usersUrl);
      const found = (usersJson.users || []).find(u => u.username === username && u.password === password);
      if (!found) { error = 'Credenciais inválidas'; return; }
      logged = true;
      currentUser = found.username;
      sheet = sheetBundle ?? await fetchJSON(`${baseUrl}sheets/sheet1.json`);
      // Prefer imported data bundle when it matches the current user/sheet
      if (dataAnaBundle && dataAnaBundle.username === currentUser && dataAnaBundle.sheetId === sheet.id) {
        values = dataAnaBundle.values || {};
      } else {
        try {
          const data = await fetchJSON(`${baseUrl}data/${currentUser}_${sheet.id}.json`);
          values = data.values || {};
        } catch (e) {
          values = {};
        }
      }
    } catch (e) {
      error = e.message;
    }
  }

  function logout() {
    logged = false;
    currentUser = null;
    sheet = null;
    values = {};
    username = '';
    password = '';
  }
</script>

<main>
  {#if !logged}
    <section class="login">
      <h1>Login</h1>
      <label>Base URL (opcional):
        <input type="text" bind:value={baseUrl} placeholder="./ or https://raw.githubusercontent.com/USER/REPO/BRANCH/" />
      </label>
      <label>Usuário:
        <input type="text" bind:value={username} />
      </label>
      <label>Senha:
        <input type="password" bind:value={password} />
      </label>
      <button on:click={handleLogin}>Entrar</button>
      {#if error}<p class="error">{error}</p>{/if}
    </section>
  {:else}
    <section class="toolbar">
      <div>Logado como <strong>{currentUser}</strong></div>
      <button on:click={logout}>Sair</button>
    </section>
    {#if sheet}
      <section class="sheet">
        <h2>{sheet.id}</h2>
        <RenderGrid {sheet} {values} on:change={e => updateValue(e.detail.id, e.detail.value)} />
      </section>
    {/if}
  {/if}
</main>

<style>
  main { padding: 16px; font-family: system-ui, sans-serif; }
  .login { max-width: 480px; margin: 40px auto; display:flex; flex-direction:column; gap:8px }
  label { display:flex; flex-direction:column; font-size:14px }
  input[type=text], input[type=password] { padding:8px; font-size:14px }
  button { padding:8px 12px; margin-top:8px }
  .error { color:crimson }
  .sheet { margin-top:16px }
</style>
