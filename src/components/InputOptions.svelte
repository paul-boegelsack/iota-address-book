<script>
    import Link from './common/Link.svelte'
    
    export let inputModes = [{name: "mode", active: true}]
    export let changeInputMode;
</script>

<p class="columns panel-tabs">
    {#each inputModes as mode}
        <Link name={mode.name} active={mode.active} activateLink={changeInputMode}/>
    {/each}
</p>