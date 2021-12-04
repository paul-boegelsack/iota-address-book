<script>
    export let name = 'Link';
    export let target = '#';
    export let active = true;
    export let activateLink;
</script>

<style>
    a:focus{
        outline:none;
    }
</style>

<a class:is-active={active} href={target} on:click={activateLink.bind({name})}>{name}</a>