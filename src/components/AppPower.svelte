<script>
    import TextArea from "./TextArea.svelte";

    export let app;

    let isEditing;
</script>

<div class="d-flex flex-column flex-grow-1">
    {#if isEditing}
        <div class="d-flex flex-grow-1">
            <input class="flex-grow-1 form-control" bind:value={app.name}>
            <button on:click={() => isEditing = false} class="btn btn-light border">Close</button>
        </div>
        <div class="d-flex">
            <TextArea bind:content={app.description}></TextArea>
        </div>
    {:else}
        <button on:click={() => isEditing = true} class="btn btn-light border text-left flex-grow-1">{app.name}</button>
    {/if}
</div>
