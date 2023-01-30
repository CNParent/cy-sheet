<script>
    export let weapon;

    let isEditing = false;
</script>

{#if isEditing}
<div class="flex-grow-1">{weapon.name}</div>
<button on:click={() => isEditing = false} class="btn btn-dark ml-auto">Close</button>
{:else}
<button on:click={() => isEditing = true}  class="flex-grow-1 btn btn-light">{weapon.name}</button>
{/if}
