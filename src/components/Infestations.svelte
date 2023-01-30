<script>
    import infestation from "../models/infestation";
    import Infestation from "./Infestation.svelte";
    import ListItem from "./ListItem.svelte";

    export let model;

    function add() {
        model.infestations.push(infestation())
        model.infestations = model.infestations;
    }

    function move(n, item) {
        let index = model.infestations.indexOf(item);
        model.infestations.splice(index, 1);

        index += n;
        if (index < 0) index = model.infestations.length;
        else if (index > model.infestations.length) index = 0;

        model.infestations.splice(index, 0, item);
        model.infestations = model.infestations;
    }

    function remove(item) {
        let index = model.infestations.indexOf(item);
        model.infestations.splice(index, 1);
        model.infestations = model.infestations;
    }
</script>

<button on:click={add} class="btn btn-dark">Add</button>
{#each model.infestations as infestation}
    <ListItem item={infestation} {move} {remove}>
        <Infestation infestation={infestation}></Infestation>
    </ListItem>
{/each}
