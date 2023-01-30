<script>
    import nano from './../models/nano.js'
    import NanoPower from "./NanoPower.svelte";
    import ListItem from "./ListItem.svelte";

    export let model;

    function add() {
        model.nano.push(nano())
        model.nano = model.nano;
    }

    function move(n, item) {
        let index = model.nano.indexOf(item);
        model.nano.splice(index, 1);

        index += n;
        if (index < 0) index = model.nano.length;
        else if (index > model.nano.length) index = 0;

        model.nano.splice(index, 0, item);
        model.nano = model.nano;
    }

    function remove(item) {
        let index = model.nano.indexOf(item);
        model.nano.splice(index, 1);
        model.nano = model.nano;
    }

</script>

<button on:click={add} class="btn btn-dark">Add</button>
{#each model.nano as n}
    <ListItem item={n} {move} {remove}>
        <NanoPower nano={n}></NanoPower>
    </ListItem>
{/each}
