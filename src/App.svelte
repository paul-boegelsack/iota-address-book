
<script lang="ts">
	export let name: string;
	export let version: string;

	const getVersion = async (): Promise<string> => {
		version = await window.api.GetVersion();
		return version;
	}
</script>

<main>
	<h1>Hello {name}!</h1>
	<button on:click|once={getVersion}>Version: {version || "Get Version"}</button>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
