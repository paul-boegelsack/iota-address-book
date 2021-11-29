<script>
    import Address from './Address.svelte'
    export let addresses = [];
</script>
{#each addresses as address}
		<Address {address} />
{/each}