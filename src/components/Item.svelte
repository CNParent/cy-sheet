<script>
    import { afterUpdate } from 'svelte';
    
    export let item;
    export let isEditing;

    let control;

    afterUpdate(() => {
        if (isEditing) control.focus();
    });
</script>

{#if isEditing}
    <input bind:this={control} class="form-control flex-grow-1" bind:value={item}>
    <button on:click={() => isEditing = false} class="btn btn-light">Close</button>
{:else}
    <button on:click={() => isEditing = true} class="btn btn-dark text-left flex-grow-1">{item}</button>
{/if}
