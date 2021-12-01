<script>
    import Link from './common/Link.svelte'
    
    export let links = [{name: "Link", active: true}]
    export let activateLink;
</script>

<p class="columns panel-tabs">
    {#each links as link}
        <Link {link} {activateLink}/>
    {/each}
</p>