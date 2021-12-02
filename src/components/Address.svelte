<script>
    export let address = {
        bechAddress: "",
        balance: 0.00,
        active: true
    };
    export let onDelete;
</script>

<div class="panel-block" class:is-hidden={!address.active}>
    <div class="column is-flex is-align-content-flex-start is-three-fifth">{address.bechAddress}</div>
    <div class="column is-one-fifth">{address.balance} MI</div>
    <button class="delete" on:click={onDelete.bind({bechAddress: address.bechAddress})}></button>
</div>