<script>
  import { createEventDispatcher } from "svelte";
  import Field from "./components/Field.svelte";
  import Computed from "./components/Computed.svelte";
  import Submatrix from "./components/Submatrix.svelte";
  import Static from "./components/Static.svelte";
  import Image from "./components/Image.svelte";
  import Checkbox from "./components/Checkbox.svelte";
  import Select from "./components/Select.svelte";
  import Separator from "./components/Separator.svelte";
  import List from "./components/List.svelte";

  export let sheet;
  export let values = {};
  const dispatch = createEventDispatcher();

  function getCellValue(id) {
    return values[id] ?? "";
  }

  function emitChange(id, rawValue, fieldType) {
    const value =
      fieldType === "number"
        ? rawValue === ""
          ? ""
          : Number(rawValue)
        : rawValue;
    dispatch("change", { id, value });
  }

  // computed values cache
  let computed = {};

  function safeCompute(expr) {
    if (!expr) return "";
    let s = String(expr);
    // find identifiers (variables)
    const ids = s.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
    const uniq = [...new Set(ids)];
    // allowed function patterns we will permit (keep names intact)
    const allowedFuncs = ["Math", "floor", "ceil", "round", "abs"];
    for (const id of uniq) {
      if (allowedFuncs.includes(id)) continue; // don't replace function names
      // replace identifier with numeric value (or 0)
      const raw = values[id];
      const num =
        raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
      s = s.replace(
        new RegExp("\\b" + id + "\\b", "g"),
        String(isNaN(num) ? 0 : num)
      );
    }
    // after replacing variables, allow only numbers, operators, dots, parentheses, commas and allowed Math functions
    // temporarily remove allowed Math.function occurrences to check for stray letters
    const tmp = s.replace(/Math\.(floor|ceil|round|abs)\(/g, "");
    if (/[A-Za-z]/.test(tmp)) return null;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("return (" + s + ")");
      return fn();
    } catch (e) {
      return null;
    }
  }

  // recompute computed fields whenever `values` or `sheet` change
  $: if (sheet) {
    const next = {};
    for (const row of sheet.cells || []) {
      for (const cell of row || []) {
        if (!cell) continue;
        if (cell.type === "computed") {
          const v = safeCompute(cell.expr);
          next[cell.id] = v;
          if (values[cell.id] !== v)
            dispatch("change", { id: cell.id, value: v });
        }
        if (cell.type === "submatrix") {
          for (const subrow of cell.cells || []) {
            for (const subcell of subrow || []) {
              if (!subcell) continue;
              if (subcell.type === "computed") {
                const v2 = safeCompute(subcell.expr);
                next[subcell.id] = v2;
                if (values[subcell.id] !== v2)
                  dispatch("change", { id: subcell.id, value: v2 });
              }
            }
          }
        }
      }
    }
    computed = next;
  }
</script>

{#if sheet}
  <div class="grid">
    {#each sheet.cells as row, rindex}
      <div
        class="grid-row"
        style="grid-template-columns: repeat({sheet.cols}, 1fr);"
      >
        {#each row as cell, cindex}
          {#if cell}
            <div
              class="cell"
              style="grid-column: span {cell.colspan ??
                1}; grid-row: span {cell.rowspan ?? 1};"
            >
              {#if cell.type === "field"}
                <Field
                  {cell}
                  {values}
                  on:change={(e) => dispatch("change", e.detail)}
                />
              {:else if cell.type === "computed"}
                <Computed
                  id={cell.id}
                  label={cell.label}
                  value={computed[cell.id]}
                />
              {:else if cell.type === "submatrix"}
                <Submatrix
                  {cell}
                  {values}
                  {computed}
                  on:change={(e) => dispatch("change", e.detail)}
                />
              {:else if cell.type === "static"}
                <Static text={cell.text} />
              {:else if cell.type === "image"}
                <Image
                  id={cell.id}
                  src={values[cell.id] ?? cell.src}
                  alt={cell.alt}
                  on:change={(e) => dispatch("change", e.detail)}
                />
              {:else if cell.type === "checkbox"}
                <Checkbox
                  {cell}
                  {values}
                  on:change={(e) => dispatch("change", e.detail)}
                />
              {:else if cell.type === "select"}
                <Select
                  {cell}
                  {values}
                  on:change={(e) => dispatch("change", e.detail)}
                />
              {:else if cell.type === "separator"}
                <Separator colspan={cell.colspan ?? 1} />
              {:else if cell.type === "list"}
                <List
                  {cell}
                  {values}
                  on:change={(e) => dispatch("change", e.detail)}
                />
              {:else}
                <div>Tipo não suportado: {cell.type}</div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style>
  .grid {
    display: grid;
    gap: 8px;
  }
  .cell {
    background: var(--color-cellBackground);
    padding: 8px;
    border: 1px solid var(--color-cellBorder);
  }
  .grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .grid-row {
    display: grid;
    gap: 8px;
  }
  
  /* styles for generic grid and cell only; field-specific styles moved to components */
</style>
