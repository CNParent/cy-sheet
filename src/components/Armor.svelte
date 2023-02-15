<script>
    export let model;

    const armorValues = ['-', '-d2', '-d4', '-d6', '-d8'];

    let isEditingArmor;
</script>

<span>Armor</span>
<div class="d-flex mb-1">
    {#if isEditingArmor}
        <input class="form-control flex-grow-1" bind:value={model.armor}>
        <div class="pl-1 pr-1">
            <select class="form-control" bind:value={model.armorValue}>
                {#each armorValues as a}
                    <option value={a}>{a}</option>
                {/each}
            </select>
        </div>
        <button on:click={() => isEditingArmor = false} class="btn btn-light ml-1 border-dark">Done</button>
    {:else}
        <button on:click={() => isEditingArmor = true} class="btn btn-light border text-left flex-grow-1">{model.armor}</button>
        <button on:click={() => isEditingArmor = true} class="btn btn-light border text-left ml-1">{model.armorValue}</button>
    {/if}
</div>
