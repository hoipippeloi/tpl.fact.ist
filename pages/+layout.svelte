<script>
	import '@evidence-dev/tailwind/fonts.css';
	import '../app.css';
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;

	import NavMenu from "$lib/ui/NavMenu.svelte";

</script>

<svelte:head>
	<title>Evidence starter template</title>
	<link rel="stylesheet" href="https://unpkg.com/franken-ui-releases@0.0.11/dist/green.min.css" />
	<script src="https://cdn.jsdelivr.net/npm/uikit@3.20.8/dist/js/uikit.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/uikit@3.20.8/dist/js/uikit-icons.min.js"></script>
</svelte:head>

<EvidenceDefaultLayout {data}
	title='My App'
  	neverShowQueries=true
  	githubRepo='https://github.com/hoipippeloi/_evidence-starter-template'
  	hideSidebar=true
  	fullWidth=true
  	maxWidth=1440
	>

	<NavMenu {data} />
	<slot slot="content" />

</EvidenceDefaultLayout>
