<script lang="ts">
    export let address = {
        bechAddress: '',
        balance: 0.00,
        active: true
    };
    export let onCopy;
    export let onDelete;
</script>

<style>
    .address {
        overflow: hidden !important;
    }
    .copy {
        color: rgba(10, 10, 10, 0.2)
    }
    .copy:hover {
        color: rgba(10, 10, 10, 0.4);
        cursor: pointer;
    }
</style>

<div id={address.bechAddress} class="address column is-flex is-align-content-flex-start is-three-fifth">
    {address.bechAddress}
</div>
<span class="copy icon ml-3" on:click={onCopy.bind({bechAddress: address.bechAddress})}>
    <i class="fas fa-copy"></i>
</span>
<div class="column is-one-fifth">{address.balance} MI</div>
<button class="delete" on:click={onDelete.bind({bechAddress: address.bechAddress})}></button>