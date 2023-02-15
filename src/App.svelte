<script>
	import character from "./models/character.js"

	import { theme } from './lib/styles.js'

	import Apps from "./components/Apps.svelte";
	import Bio from "./components/Bio.svelte";
	import Details from "./components/Details.svelte";
    import Inventory from "./components/Inventory.svelte";
	import Nano from "./components/Nano.svelte";
	import Navbar from "./components/Navbar.svelte";
	import Status from "./components/Status.svelte";
    import Infestations from "./components/Infestations.svelte";
    import Cybertech from "./components/Cybertech.svelte";
    import Notes from "./components/Notes.svelte";

	let model = character();
</script>

<svelte:head>
	{#if theme == 'dark'}
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vinorodrigues/bootstrap-dark@0.6.1/dist/bootstrap-dark.min.css">
	{:else}
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css" integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn" crossorigin="anonymous">
	{/if}
</svelte:head>

<main id="app">
	<Navbar bind:model={model}></Navbar>
	<div class="row m-2">
		<Details title="Bio" open="open"><Bio model={model}></Bio></Details>
		<Details title="Status" open="open"><Status model={model}></Status></Details>
		<Details title="Inventory"><Inventory model={model}></Inventory></Details>
		<Details title="Apps"><Apps model={model}></Apps></Details>
		<Details title="Nano"><Nano model={model}></Nano></Details>
		<Details title="Infestations"><Infestations model={model}></Infestations></Details>
		<Details title="Cybertech"><Cybertech model={model}></Cybertech></Details>
		<Details title="Notes"><Notes notes={model.notes}></Notes></Details>
	</div>
</main>
