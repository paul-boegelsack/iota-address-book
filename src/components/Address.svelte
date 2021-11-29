<script>
    export let address = {
        id: 0,
        txid: "",
        balance: 0.00
    };
</script>

<div class="panel-block columns">
    <div class="column is-flex is-align-content-flex-start is-three-fifth">{address.txid}</div>
    <div class="column is-one-fifth">{address.balance}</div>
    <button class="delete"></button>
</div>