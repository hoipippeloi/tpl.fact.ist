<script>
  import SveltePlayer from "svelte-player";

  let player;
  let currentTime = 0;
  let videoUrl = "https://www.youtube.com/watch?v=6zqTu2zXemI";
  let videoId = '';
  let playing = false;
  let errorMessage = "";
  let logsContent = "";
  let coordinates = { x: 0, y: 0 };

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

  // Function to get coordinates relative to the image
  const getCoordinates = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    coordinates = { x: x.toFixed(2), y: y.toFixed(2) };
  };
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

                                <div>
                                    <ul class="uk-tab-left" uk-tab>
                                        <li><a href="#">Start</a></li>
                                    <li><a href="#">Who</a></li>
                                    <li><a href="#">What</a></li>
                                    <li><a href="#">A</a></li>
                                    <li><a href="#">B</a></li>
                                    <li><a href="#">Target</a></li>
                                    <li><a href="#">Result</a></li>
                                    <li><a href="#">Reason</a></li>
                                    <li><a href="#">Flags</a></li>
                                    <li><a href="#">Custom</a></li>
                                    </ul>
                                </div>

                                <div class="uk-switcher uk-margin">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </div>
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