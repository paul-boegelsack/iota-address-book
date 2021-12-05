<script>
    export let onInput;
    export let placeholder;
    export let onKeypress;
</script>

<input class="input" on:input={onInput} on:keypress={onKeypress} type="text" {placeholder} />

