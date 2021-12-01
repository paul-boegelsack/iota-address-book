<script>
    import Address from './Address.svelte'
    export let addresses = [];
    export let onAddressDelete;
</script>
{#each addresses as address}
		<Address onDelete={onAddressDelete} {address} />
{/each}