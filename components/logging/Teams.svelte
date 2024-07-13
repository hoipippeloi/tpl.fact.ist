<script>
  import { onMount } from "svelte";
  export let csvUrl = '';

  let teams = [];
  let activeTeam = '';

  // Fetch CSV data on component mount
  onMount(async () => {
    try {
      console.log(`Fetching CSV from: ${csvUrl}`);
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
      }
      const csvText = await response.text();
      console.log(`CSV Content: ${csvText}`);
      
      // Split CSV text into lines
      const lines = csvText.trim().split('\n');
      
      // Extract headers
      const headers = lines[0].split(',').map(item => item.trim());
      const teamIndex = headers.indexOf('team');
      const csvFileIndex = headers.indexOf('csv_file');
      
      if (teamIndex === -1 || csvFileIndex === -1) {
        throw new Error("Expected headers 'team' and 'csv_file' not found in CSV");
      }

      // Extract teams and csv_file
      teams = lines.slice(1).map(line => {
        const columns = line.split(',').map(item => item.trim());
        return {
          team: columns[teamIndex],
          csvFile: columns[csvFileIndex]
        };
      });
      
      console.log(`Teams:`, teams);

      // Check for the 't' parameter in the URL and set active team
      const urlParams = new URLSearchParams(window.location.search);
      const tParam = urlParams.get('t');
      if (tParam) {
        activeTeam = tParam;
      }
    } catch (error) {
      console.error("Failed to load CSV data:", error);
    }
  });

  // Function to handle button click
  function setActiveTeam(event, csvFile) {
    event.preventDefault(); // Prevent the default anchor tag behavior
    activeTeam = csvFile;

    // Update the URL without reloading the page
    const url = new URL(window.location);
    url.searchParams.set('t', csvFile);
    history.pushState({}, '', url);
  }
</script>

<div class="uk-margin" style="margin-top:10px;">
  <label class="uk-form-label" for="form-stacked-text">Team</label>
  <div>
    {#each teams as teamData}
      <a 
        class="uk-button {activeTeam === teamData.csvFile ? 'uk-button-secondary' : 'uk-button-default'}" 
        style="margin-right:10px;margin-top:0px;" 
        href="?t={teamData.csvFile}" 
        on:click="{(event) => setActiveTeam(event, teamData.csvFile)}"
      >
        {teamData.team}
      </a>
    {/each}
  </div>
</div>