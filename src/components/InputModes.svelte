<script lang="ts">
    import type { InputMode } from '../lib/InputMode'
    import Link from './common/Link.svelte'
    
    export let inputModes: InputMode[]
    export let onChangeInputMode;
</script>

{#each inputModes as mode}
    <Link name={mode.GetName()} active={mode.GetActive()} activateLink={onChangeInputMode}/>
{/each}