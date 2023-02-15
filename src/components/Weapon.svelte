<script>
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
</script>

<div class="d-flex flex-column flex-grow-1">
    <div class="d-flex">
        {#if isEditing}
            <input bind:value={weapon.name} class="form-control flex-grow-1">
            <button on:click={() => isEditing = false} class="btn btn-light border-dark ml-auto">Close</button>
        {:else}
            <button on:click={() => isEditing = true}  class="flex-grow-1 btn btn-light text-left border">{weapon.name}</button>
        {/if}
    </div>
    <div class="d-flex mt-1">
        {#if isEditing}
            <div class="border-right d-flex">
                <input type="number" min={0} class="form-control" bind:value={weapon.mags}>
            </div>
            <div class="border-right d-flex ml-1">
                <select class="form-control" bind:value={weapon.damage}>
                    {#each damage as d}
                        <option value={d}>{d}</option>
                    {/each}
                </select>
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
        {:else}
            {#if !weapon.melee}<button class="btn btn-dark badge" on:click={magsClick}>{weapon.mags} mags</button>{/if}
            <span class="btn btn-dark badge ml-1">{weapon.damage} damage</span>
            {#if weapon.automatic && !weapon.melee}<span class="btn btn-dark badge ml-1">auto</span>{/if}
            {#if weapon.melee}<span class="btn btn-dark badge ml-1">melee</span>{/if}
        {/if}
    </div>
</div>
