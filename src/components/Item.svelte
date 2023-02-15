<script>    
    export let item;
    export let isEditing;
    export let update;
</script>

{#if isEditing}
    <input class="form-control flex-grow-1" bind:value={item.name}>
    <div>
        <input class="form-control ml-1" type="number" min="0" bind:value={item.size}>
    </div>
    <button on:click={() => { isEditing = false; update(); }} class="btn btn-light border-dark ml-1">Close</button>
{:else}
    <button on:click={() => isEditing = true} class="btn btn-light border text-left flex-grow-1">{item.name}</button>
    <button on:click={() => isEditing = true} class="btn btn-dark border ml-1">{item.size}</button>
{/if}
