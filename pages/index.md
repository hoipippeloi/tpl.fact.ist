<script>
  import SveltePlayer from "svelte-player";
  import LabelValues from '$lib/logging/LabelValues.svelte';
  import Teams from '$lib/logging/Teams.svelte';

  let player;
  let currentTime = 0;
  let videoUrl = "https://www.youtube.com/watch?v=6zqTu2zXemI";
  let videoId = '';
  let playing = false;
  let errorMessage = "";
  let logsContent = "";
  let coordinates = { x: 0, y: 0 };
  let teams = [];
  let activeTeam = '';
  let activeTab = 0;

  // Define the CSV data structure for logs
  let csvData = [
    {
      log_time: new Date().toISOString(),
      video_time: 0,
      start: '',
      who: '',
      what: 'kickoff',
      zone_a: '',
      zone_b: '',
      target: '',
      result: '',
      reason: '',
      flags: '',
      custom: ''
    }
  ];

  // Current log entry being updated
  let currentLogEntry = {
    log_time: new Date().toISOString(),
    video_time: 0,
    start: '',
    who: '',
    what: 'kickoff',
    zone_a: '',
    zone_b: '',
    target: '',
    result: '',
    reason: '',
    flags: '',
    custom: ''
  };

  // Function to get video metadata
  const getVideoMetadata = () => {
    if (player) {
      currentTime = player.getCurrentTime();
      console.log("Current Time:", currentTime);
    }
  };

  // Update metadata every second
  let interval;
  onMount(() => {
    interval = setInterval(getVideoMetadata, 1000);

    // Check for the 't' and 'tab' parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tParam = urlParams.get('t');
    if (tParam) {
      activeTeam = tParam;
    }

    const tabParam = urlParams.get('tab');
    if (tabParam) {
      activeTab = parseInt(tabParam, 10);
    }

    return () => clearInterval(interval);
  });

  const togglePlaying = () => {
    playing = !playing;
  };

  const updateVideoUrl = (event) => {
    const newUrl = event.target.value;
    try {
      const url = new URL(newUrl);
      videoUrl = newUrl;
      errorMessage = "";
      const urlParams = new URLSearchParams(url.search);
      videoId = urlParams.get('v') || newUrl;

      // Update logs content with the current CSV data
      updateLogsContent();

    } catch (e) {
      errorMessage = "Invalid URL. Please enter a valid video URL.";
    }
  };

  const updateLogsContent = () => {
    const headers = [
      'log_time',
      'video_time',
      'start',
      'who',
      'what',
      'zone_a',
      'zone_b',
      'target',
      'result',
      'reason',
      'flags',
      'custom'
    ];
    const rows = csvData.map(row => headers.map(header => row[header]).join(','));
    logsContent = [headers.join(','), ...rows].join('\n');
  };

  // Function to add the current log entry to the log
  const addCurrentLogEntry = () => {
    currentLogEntry.log_time = new Date().toISOString();
    currentLogEntry.video_time = currentTime;
    csvData.push({ ...currentLogEntry });
    updateLogsContent();
    console.log("Log entry added:", currentLogEntry);

    // Reset current log entry
    currentLogEntry = {
      log_time: new Date().toISOString(),
      video_time: 0,
      start: '',
      who: '',
      what: '',
      zone_a: '',
      zone_b: '',
      target: '',
      result: '',
      reason: '',
      flags: '',
      custom: ''
    };
  };

  // Initialize logs content with the current CSV data
  updateLogsContent();

  // Function to get coordinates relative to the image
  const getCoordinates = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    coordinates = { x: x.toFixed(2), y: y.toFixed(2) };
  };

  // Function to handle button click
  function setActiveTeam(event, csvFile) {
    event.preventDefault(); // Prevent the default anchor tag behavior
    activeTeam = csvFile;

    // Update the URL without reloading the page
    const url = new URL(window.location);
    url.searchParams.set('t', csvFile);
    history.pushState({}, '', url);
  }

  // Function to handle tab click
  function setActiveTab(index) {
    activeTab = index;

    // Update the URL without reloading the page
    const url = new URL(window.location);
    url.searchParams.set('tab', index);
    history.pushState({}, '', url);
  }

  // Fetch teams data from CSV
  async function fetchTeams(csvUrl) {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
      }
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(item => item.trim());
      const teamIndex = headers.indexOf('team');
      const csvFileIndex = headers.indexOf('csv_file');

      if (teamIndex === -1 || csvFileIndex === -1) {
        throw new Error("Expected headers 'team' and 'csv_file' not found in CSV");
      }

      teams = lines.slice(1).map(line => {
        const columns = line.split(',').map(item => item.trim());
        return {
          team: columns[teamIndex],
          csvFile: columns[csvFileIndex]
        };
      });

      // Set active team if 't' parameter is present
      const urlParams = new URLSearchParams(window.location.search);
      const tParam = urlParams.get('t');
      if (tParam) {
        activeTeam = tParam;
      }
    } catch (error) {
      console.error("Failed to load CSV data:", error);
    }
  }

  // Fetch teams data on mount
  onMount(() => {
    fetchTeams('./data/teams.csv');
  });

  // Reactive statement to dynamically set the csvUrl for LabelValues
  $: csvUrlForLabelValues = activeTeam ? `./data/teams/${activeTeam}` : '';

  // Function to handle label click
  const handleLabelClick = (field, label) => {
    currentLogEntry[field] = label;
    currentLogEntry.log_time = new Date().toISOString(); // Update timestamp
    currentLogEntry.video_time = currentTime; // Update video time
    console.log("Label clicked:", label);
    console.log("Updated currentLogEntry:", currentLogEntry);
  };
</script>

<div style="margin-top:-30px;">
  <ul uk-tab>
    <li class="{activeTab === 0 ? 'uk-active' : ''}" on:click={() => setActiveTab(0)}><a href="#">Settings</a></li>
    <li class="{activeTab === 1 ? 'uk-active' : ''}" on:click={() => setActiveTab(1)}><a href="#">Annotate</a></li>
    <li class="{activeTab === 2 ? 'uk-active' : ''}" on:click={() => setActiveTab(2)}><a href="#">Logs</a></li>
  </ul>

  <div class="uk-switcher uk-margin">
    <div class="{activeTab === 0 ? 'uk-active' : ''}">
      <div style="margin:0;" class="uk-width-1-1">
        <label class="uk-form-label" for="form-stacked-text">Video URL</label>
        <input class="uk-input" type="text" bind:value={videoUrl} on:input={updateVideoUrl} placeholder="Enter video URL">
      </div>
      <div style="margin:0;" class="uk-width-1-1">
        <Teams csvUrl="./data/teams.csv" />
      </div>
    </div>
    <div class="{activeTab === 1 ? 'uk-active' : ''}">
      <div class="uk-grid-small" uk-grid>
        <div class="player uk-width-2-3">
          {#if errorMessage}
            <div class="uk-width-1-1">
              <div class="uk-alert-danger" uk-alert>
                <a href class="uk-alert-close" uk-close></a>
                <p style="padding:auto 10px;">{errorMessage}</p>
              </div>
            </div>
          {:else}
            <div class="player-wrapper">
              <SveltePlayer
                bind:this={player}
                url={videoUrl}
                {playing}
                controls={true}
              />
            </div>
          {/if}
        </div>
        <div style="margin-left:0px;padding:0;position:relative;" class="controls uk-width-1-3 uk-grid-small">
          <div class="uk-grid-small" uk-grid> 
            <div class="field">
              <img src="/img/field.png" alt="Field" style="height:100%;width:100%;" on:mousemove={getCoordinates}>
              <div class="coordinates">
                X: {coordinates.x}, Y: {coordinates.y}
              </div>
            </div>
            <div class="logging">
              <div>
                <div uk-grid>
                  <div class="uk-width-auto@m">
                    <ul class="uk-tab-left" uk-tab="connect: #component-tab-left; animation: uk-animation-fade">
                      <li><a href="#">Start</a></li>
                      <li><a href="#">Who</a></li>
                      <li><a href="#">What</a></li>
                      <li><a href="#">A</a></li>
                      <li><a href="#">B</a></li>
                      <li><a href="#">Target</a></li>
                      <li><a href="#">Result</a></li>
                      <li><a href="#">Reason</a></li>
                      <li><a href="#">Tags</a></li>
                      <li><a href="#">Plays</a></li>
                    </ul>
                  </div>
                  <div class="uk-width-expand@m" style="padding:5px 20px;">
                    <div id="component-tab-left" class="uk-switcher">
                      <div>
                        <LabelValues csvUrl="./data/start.csv" field="start" onLabelClick={handleLabelClick} />
                      </div>
                      <div>
                        {#if csvUrlForLabelValues}
                          <LabelValues csvUrl={csvUrlForLabelValues} field="who" onLabelClick={handleLabelClick} />
                        {:else}
                          <p>No team selected.</p>
                        {/if}
                      </div>
                      <div>
                        <LabelValues csvUrl="./data/what.csv" field="what" onLabelClick={handleLabelClick} />
                      </div>
                      <div>
                        <p>Select start position on the field above.</p>
                      </div>
                      <div>
                        <p>Select end position on the field above.</p>
                      </div>
                      <div>
                        {#if csvUrlForLabelValues}
                          <LabelValues csvUrl={csvUrlForLabelValues} field="target" onLabelClick={handleLabelClick} />
                        {:else}
                          <p>No team selected.</p>
                        {/if}
                      </div>
                      <div>
                        <LabelValues csvUrl="./data/result.csv" field="result" onLabelClick={handleLabelClick} />
                      </div>
                      <div>
                        <LabelValues csvUrl="./data/reason.csv" field="reason" onLabelClick={handleLabelClick} />
                      </div>
                      <div>
                        <LabelValues csvUrl="./data/tags.csv" field="tags" onLabelClick={handleLabelClick} />
                      </div>
                      <div>
                        <LabelValues csvUrl="./data/plays.csv" field="plays" onLabelClick={handleLabelClick} />
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="{activeTab === 2 ? 'uk-active' : ''}">
      <pre>{logsContent}</pre>
      <button on:click={addCurrentLogEntry}>Add Log Entry</button>
    </div>
  </div>
</div>

<style>
  .error-message {
    color: #333;
    margin-bottom: 10px;
  }

  .player-wrapper {
    height: 80vh; /* Set the height to 80% of the viewport height */
    width: 100%;  /* Ensure the player takes the full width */
  }

  .player-wrapper svelte-player {
    height: 100%; /* Make sure the player component takes the full height of the wrapper */
    width: 100%;  /* Make sure the player component takes the full width of the wrapper */
  }

  .field {
    position: relative; /* Ensure the coordinates container is positioned relative to the field */
  }

  .field img {
    height: 100%; /* Make sure the image takes the full height of the div */
    width: 100%;  /* Make sure the image takes the full width of the div */
    object-fit: cover; /* Cover the entire div with the image */
  }

  .coordinates {
    position: absolute;
    top: -24px;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 5px;
    border-radius: 3px;
    z-index: 1000;
    font-size:0.8em;
  }

  .uk-label {
    font-size:0.9em;
  }
</style>