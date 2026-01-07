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

  // GitHub settings for client-side commits (user-provided PAT).
  // Stored in sessionStorage so the user can enter once per browser session.
  let gitOwner = sessionStorage.getItem('gitOwner') || 'atmr0';
  let gitRepo = sessionStorage.getItem('gitRepo') || 'RPG-HUNTER-X-HUNTER';
  let gitBranch = sessionStorage.getItem('gitBranch') || 'gh-pages';
  let gitToken = sessionStorage.getItem('gitToken') || '';

  let saving = false;

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

  function saveSettings() {
    sessionStorage.setItem('gitOwner', gitOwner || '');
    sessionStorage.setItem('gitRepo', gitRepo || '');
    sessionStorage.setItem('gitBranch', gitBranch || 'main');
    sessionStorage.setItem('gitToken', gitToken || '');
    alert('Configurações salvas localmente (sessionStorage).');
  }

  // Save to GitHub by creating/updating a file in the repo using user's PAT
  async function saveToRepo() {
    if (!currentUser || !sheet) return alert('Usuário/Sheet não definidos');
    if (!gitOwner || !gitRepo || !gitToken) return alert('Preencha as configurações do GitHub (owner/repo/token) e clique em Salvar configurações');
    saving = true;
    const path = `data/${currentUser}_${sheet.id}.json`;
    const contentObj = { username: currentUser, sheetId: sheet.id, values };
    // base64 in browser: use utf8 safe method
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(contentObj, null, 2))));

    const headers = { 'Authorization': `token ${gitToken}`, 'Accept': 'application/vnd.github+json' };
    try {
      // check if exists to get sha
      const getUrl = `https://api.github.com/repos/${gitOwner}/${gitRepo}/contents/${encodeURIComponent(path)}?ref=${gitBranch}`;
      const getRes = await fetch(getUrl, { headers });
      let sha = null;
      if (getRes.status === 200) {
        const j = await getRes.json();
        sha = j.sha;
      }

      const putUrl = `https://api.github.com/repos/${gitOwner}/${gitRepo}/contents/${encodeURIComponent(path)}`;
      const body = { message: `Update data for ${currentUser} ${sheet.id}`, content: contentBase64, branch: gitBranch };
      if (sha) body.sha = sha;

      const putRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!putRes.ok) {
        const txt = await putRes.text();
        throw new Error(txt || `Status ${putRes.status}`);
      }
      alert('Salvo no repositório com sucesso.');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar: ' + e.message);
    } finally {
      saving = false;
    }
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
      <details>
        <summary>Configurações GitHub (opcional, para salvar)</summary>
        <label>Owner (usuário/org):
          <input type="text" bind:value={gitOwner} placeholder="github-username" />
        </label>
        <label>Repo:
          <input type="text" bind:value={gitRepo} placeholder="repo-name" />
        </label>
        <label>Branch:
          <input type="text" bind:value={gitBranch} placeholder="main" />
        </label>
        <label>Personal Access Token (coloque com escopo repo/public_repo):
          <input type="password" bind:value={gitToken} placeholder="ghp_xxx..." />
        </label>
        <button on:click={saveSettings}>Salvar configurações</button>
      </details>
      <button on:click={handleLogin}>Entrar</button>
      {#if error}<p class="error">{error}</p>{/if}
    </section>
  {:else}
    <section class="toolbar">
      <div>Logado como <strong>{currentUser}</strong></div>
      <button on:click={logout}>Sair</button>
        <button on:click={saveToRepo} disabled={!sheet || saving} class="save">{saving ? 'Salvando...' : 'Salvar'}</button>
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
