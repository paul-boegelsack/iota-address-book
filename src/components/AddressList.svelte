<script>
    import Address from './Address.svelte'
    export let addresses = [];
    export let onAddressCopied;
    export let onAddressDelete;
</script>
{#each addresses as address}
		<Address onDelete={onAddressDelete} onCopy={onAddressCopied} {address} />
{/each}