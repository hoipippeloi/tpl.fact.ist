<script>
  import { onMount } from "svelte";
  export let csvUrl = '';
  export let field = '';
  export let onLabelClick = () => {};

  let labelValues = [];

  // Fetch CSV data on component mount
  onMount(async () => {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
      }
      const csvText = await response.text();
      labelValues = csvText.trim().split('\n').map(item => item.trim());
    } catch (error) {
      console.error("Failed to load CSV data:", error);
    }
  });
</script>

{#each labelValues as value}
  <span class="uk-label" style="margin:5px;" on:click={() => onLabelClick(field, value)}>{value}</span>
{/each}

<style>
span.uk-label {
  font-size:0.85em;
  cursor:pointer;
}
</style>