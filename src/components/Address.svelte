<script>
    export let address = {
        bechAddress: "",
        balance: 0.00
    };
</script>

<div class="panel-block columns">
    <div class="column is-flex is-align-content-flex-start is-three-fifth">{address.bechAddress}</div>
    <div class="column is-one-fifth">{address.balance} MI</div>
    <button class="delete"></button>
</div>