<script>
    export let move;
    export let item;
    export let isEditing;
</script>

{#if isEditing}
{:else}
    <button class="btn btn-light text-left">{item.name}</button>
{/if}
