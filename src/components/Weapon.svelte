<script>
    import { afterUpdate } from 'svelte';

    export let weapon;

    const damage = ['1', 'd2', 'd3', 'd4', 'd6', 'd8', 'd10', 'd12'];

    function magsClick(e) {
        let value = e.shiftKey ? 1 : -1;
        weapon.mags += value;
        if (weapon.mags < 0) weapon.mags = 0;
    }

    let isEditing = false;

    if (!weapon.name) weapon.name = "New Weapon";
    if (weapon.mags == null) weapon.mags = 0;

    let control;

    afterUpdate(() => {
        if (isEditing) control.focus();
    });
</script>

<div class="d-flex flex-column flex-grow-1">
    <div class="d-flex">
        {#if isEditing}
            <input bind:this={control} bind:value={weapon.name} class="form-control flex-grow-1">
            <button on:click={() => isEditing = false} class="btn btn-dark ml-auto">Close</button>
        {:else}
            <button on:click={() => isEditing = true}  class="flex-grow-1 btn btn-dark text-left">{weapon.name}</button>
        {/if}
    </div>
    <div class="d-flex mt-1">
        <div class="border-right d-flex">
            {#if isEditing}
                <input type="number" min={0} class="form-control" bind:value={weapon.mags}>
            {:else}
                <h4><button class="btn btn-dark badge" style="width: 2.0em" on:click={magsClick}>{weapon.mags}</button></h4>
            {/if}
            <span class="align-self-center ml-1 mr-1">Mags</span>
        </div>
        <div class="border-right d-flex ml-1">
            {#if isEditing}
                <select class="form-control" bind:value={weapon.damage}>
                    {#each damage as d}
                        <option value={d}>{d}</option>
                    {/each}
                </select>
            {:else}
                <span class="align-self-center">{weapon.damage}</span>
            {/if}            
            <span class="align-self-center ml-1 mr-1">Damage</span>
        </div>
        <div class="border-right d-flex ml-1">
            <label class="align-self-center d-flex align-items-center m-0">
                <input type="checkbox" bind:checked={weapon.automatic}>
                <span class="ml-1 mr-1">Auto</span>
            </label>
        </div>
        <div class="d-flex ml-1">
            <label class="align-self-center d-flex align-items-center m-0">
                <input type="checkbox" bind:checked={weapon.melee}>
                <span class="ml-1 mr-1">Melee</span>
            </label>
        </div>
    </div>
</div>
