<script lang="ts">
  import { onMount } from "svelte";
  import SveltePlayer from "svelte-player";

  let player;
  let currentTime = 0;
  let videoUrl = "https://www.youtube.com/watch?v=6zqTu2zXemI";
  let videoId = '';
  let playing = false;
  let errorMessage = "";
  let logsContent = "";

  // Define the CSV data structure
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

  // Example of adding a new log entry
  const addNewLogEntry = () => {
    const newLog = {
      log_time: new Date().toISOString(),
      video_time: currentTime,
      start: '',
      who: '',
      what: 'action',
      zone_a: '',
      zone_b: '',
      target: '',
      result: '',
      reason: '',
      flags: '',
      custom: ''
    };
    csvData.push(newLog);
    updateLogsContent();
  };

  // Initialize logs content with the current CSV data
  updateLogsContent();
</script>

<div style="margin-top:-30px;">

    <ul uk-tab>
        <li><a href="#">URL</a></li>
        <li><a href="#">Video</a></li>
        <li><a href="#">Logs</a></li>
    </ul>

    <div class="uk-switcher uk-margin">
        <div>
            <div style="margin:0;" class="uk-width-1-1">
                <input class="uk-input" type="text" bind:value={videoUrl} on:input={updateVideoUrl} placeholder="Enter video URL">
            </div>
        </div>
        <div>
            <div uk-grid>
                <div class="player uk-width-3-4">
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
                <div class="controls uk-width-1-4" uk-grid>

                    <div class="field uk-width-1-1">
                    </div>

                </div>
            </div>
        </div>
        <div>
            <pre>{logsContent}</pre>
            <button on:click={addNewLogEntry}>Add Log Entry</button>
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
</style>