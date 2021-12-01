<script>
    export let link = {name: "Link", active: true};
    export let activateLink
</script>

<a class:is-active={link.active} on:click={activateLink.bind({name: link.name})}>{link.name}</a>