<script>
    export let glitches;

    const dice = ['d2', 'd3', 'd4'];

    function handleClick(e) {
        let value = e.shiftKey ? 1 : -1;
        glitches.current += value;
        if (glitches.current < 0) glitches.current = 0;
    }

    let isEditing = false;
</script>

<div class="d-flex">
    <button on:click={handleClick} class="btn btn-dark">{glitches.current}</button>
    <span class="align-self-center ml-1">Glitches</span>
    <span class="align-self-center ml-auto">Die</span>
    {#if isEditing}
        <div class="ml-1">
            <select class="form-control" bind:value={glitches.die}>
                {#each dice as d}
                    <option value={d}>{d}</option>
                {/each}
            </select>
        </div>
        <button on:click={() => isEditing = false} class="btn btn-light border ml-1">Close</button>
    {:else}
        <button on:click={() => isEditing = true} class="btn btn-light border ml-1">{glitches.die}</button>
    {/if}
    <div class="btn-group ml-1">
        <button on:click={() => handleClick({ shiftKey: true })} class="btn btn-dark">+</button>
        <button on:click={() => handleClick({ shiftKey: false })} class="btn btn-dark">-</button>
    </div>
</div>