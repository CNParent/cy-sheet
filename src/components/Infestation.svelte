<script>
    import TextArea from "./TextArea.svelte";

    export let infestation;

    let isEditing = false;
</script>

<div class="d-flex flex-column flex-grow-1">
    {#if isEditing}
        <div class="d-flex flex-grow-1">
            <input class="flex-grow-1 form-control" bind:value={infestation.name}>
            <button on:click={() => isEditing = false} class="btn btn-light border">Close</button>
        </div>
        <span>Persistent</span>
        <div class="d-flex">
            <TextArea bind:content={infestation.persistent}></TextArea>
        </div>
        <span>Trigger</span>
        <div class="d-flex">
            <TextArea bind:content={infestation.trigger}></TextArea>
        </div>
    {:else}
        <button on:click={() => isEditing = true} class="btn btn-light border text-left flex-grow-1">{infestation.name}</button>
    {/if}
</div>
