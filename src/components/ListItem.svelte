<script>
    export let move;
    export let remove;
    export let item;

</script>

<div class="d-flex m-1">
    <div class="flex-grow-1 d-flex mr-1"><slot></slot></div>
    <div class="btn-group ml-auto">
        <button on:click={() => move(-1, item)} class="btn btn-light">&uarr;</button>
        <button on:click={() => move(1, item)} class="btn btn-light">&darr;</button>
    </div>
    <button on:click={() => remove(item)} class="btn btn-danger ml-1">Delete</button>
</div>
