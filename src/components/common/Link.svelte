<script>
    export let name = 'Link';
    export let target = '#';
    export let active = true;
    export let activateLink;
</script>

<a class:is-active={active} href={target} on:click={activateLink.bind({name})}>{name}</a>

<style>
    a:focus{
        outline:none;
    }
</style>