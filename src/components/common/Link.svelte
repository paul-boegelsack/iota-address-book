<script>
    export let name = 'Link';
    export let target = '#';
    export let active = true;
    export let activateLink;
</script>

<style>
    a {
        color: #131f3788;
    }
    a.active {
        color: #131f37
    }
    a:focus{
        outline:none;
    }
</style>

<a class:is-active={active} href={target} on:click={activateLink.bind({name})}>{name}</a>