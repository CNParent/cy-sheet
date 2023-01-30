<script>
    import infestation from "../models/infestation";
import Infestation from "./Infestation.svelte";
    import TextArea from "./TextArea.svelte";
    
    export let nano;

    function handleUsed(e) {
        let value = e.shiftKey ? -1 : 1;
        nano.used += value;
        if (nano.used < 0) nano.used = 0;
    }

    let isEditing;
</script>

<div class="d-flex flex-grow-1">
    {#if isEditing}
        <div class="d-flex flex-column flex-grow-1">
            <div class="d-flex flex-grow-1">
                <input class="flex-grow-1 form-control" bind:value={nano.name}>
                <button on:click={() => isEditing = false} class="btn btn-light border">Close</button>
                <button on:click={handleUsed} class="btn btn-dark ml-1">{nano.used}</button>
                <button on:click={() => nano.used = 0} class="btn btn-light border ml-1">Reset</button>
            </div>
            <div class="d-flex">
                <TextArea bind:content={nano.description}></TextArea>
            </div>
            <span>Linked Infestation</span>
            <div class="pl-3">
                <Infestation infestation={nano.infestation}></Infestation>
            </div>
        </div>
    {:else}
        <button on:click={() => isEditing = true} class="btn btn-light border text-left flex-grow-1">{nano.name}</button>
        <button on:click={handleUsed} class="btn btn-dark ml-1">{nano.used}</button>
        <button on:click={() => nano.used = 0} class="btn btn-light border ml-1">Reset</button>
    {/if}
</div>
