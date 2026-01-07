<script>
  import { onMount } from 'svelte';
  import RenderGrid from './RenderGrid.svelte';
  import { applyTheme } from './components/theme.js';
  if (typeof document !== 'undefined') applyTheme();
  // Import local JSON bundles so the bundler includes them in the output.
  // These imports will be inlined when we build the single-file HTML.
  import usersBundle from '../users.json';
  import sheetBundle from '../sheets/Ficha.json';
  import { SHEET_BASE, GIT_OWNER, GIT_REPO, GIT_BRANCH, GIT_TOKEN } from './config.js';
  // import all JSON files under `src/data` automatically (included in the bundle)
  const _dataModules = import.meta.glob('../data/*.json', { eager: true, as: 'json' });
  const dataBundles = {};
  for (const p in _dataModules) {
    const d = _dataModules[p];
    if (d && d.username && d.sheetId) {
      dataBundles[`${d.username}_${d.sheetId}`] = d;
    }
  }

  // SHEET_BASE is imported from src/config.js

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
  let gitOwner = sessionStorage.getItem('gitOwner') || GIT_OWNER;
  let gitRepo = sessionStorage.getItem('gitRepo') || GIT_REPO;
  let gitBranch = sessionStorage.getItem('gitBranch') || GIT_BRANCH;
  let gitToken = sessionStorage.getItem('gitToken') || GIT_TOKEN;

  let saving = false;

  function updateValue(id, value) {
    // normalize numeric inputs
    const numericIds = new Set(['STR','DEX','CON','INT','WIS','CHA','STR_mod','DEX_mod','CON_mod','INT_mod','WIS_mod','CHA_mod','level','AC','HP_current','HP_max','proficiency','inspiration','passive_perception']);
    let v = value;
    if (numericIds.has(id)) {
      // allow empty string to clear value
      v = (v === '' || v === null || v === undefined) ? '' : Number(v);
      if (Number.isNaN(v)) v = '';
    }

    const next = { ...values, [id]: v };

    // If an attribute changed, update its modifier
    const attrs = ['STR','DEX','CON','INT','WIS','CHA'];
    function calcMod(score) {
      const n = Number(score) || 0;
      return Math.floor((n - 10) / 2);
    }

    if (attrs.includes(id)) {
      const modId = `${id}_mod`;
      next[modId] = calcMod(v);
    }

    // If proficiency or WIS_mod changed, update passive perception
    const recomputePassive = (id === 'WIS' || id === 'WIS_mod' || id === 'proficiency');
    if (recomputePassive) {
      const wisMod = Number(next['WIS_mod'] ?? calcMod(next['WIS']));
      const prof = Number(next['proficiency'] || 0);
      next['passive_perception'] = 10 + (Number.isNaN(wisMod) ? 0 : wisMod) + (Number.isNaN(prof) ? 0 : prof);
    }

    values = next;
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
      sheet = sheetBundle ?? await fetchJSON(`${baseUrl}${SHEET_BASE}`);
      // Prefer any imported data bundle (auto-loaded from src/data) when it matches the current user/sheet
      const key = `${currentUser}_${sheet.id}`;
      if (dataBundles[key]) {
        values = dataBundles[key].values || {};
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

  function exportToFile() {
    if (!currentUser || !sheet) return alert('Usuário/Sheet não definidos');
    const contentObj = { username: currentUser, sheetId: sheet.id, values };
    const blob = new Blob([JSON.stringify(contentObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser}_${sheet.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  onMount(() => applyTheme());
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
      <button on:click={exportToFile} disabled={!sheet}>Exportar</button>
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
