<script lang="ts">
    import Address from './Address.svelte'
    export let addresses = [];
    export let onAddressCopied;
    export let onAddressDelete;
</script>

{#each addresses as address}
    <div class="panel-block" class:is-hidden={!address.active}>
		<Address onDelete={onAddressDelete} onCopy={onAddressCopied} {address} />
    </div>
{/each}