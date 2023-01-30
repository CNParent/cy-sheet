<script>
    import cyberware from "../models/cyberware";
    import Cyberware from "./Cyberware.svelte";
    import ListItem from "./ListItem.svelte";

    export let model;

    function add() {
        model.cybertech.push(cyberware())
        model.cybertech = model.cybertech;
    }

    function move(n, item) {
        let index = model.cybertech.indexOf(item);
        model.cybertech.splice(index, 1);

        index += n;
        if (index < 0) index = model.cybertech.length;
        else if (index > model.cybertech.length) index = 0;

        model.cybertech.splice(index, 0, item);
        model.cybertech = model.cybertech;
    }

    function remove(item) {
        let index = model.cybertech.indexOf(item);
        model.cybertech.splice(index, 1);
        model.cybertech = model.cybertech;
    }
</script>

<button on:click={add} class="btn btn-dark">Add</button>
{#each model.cybertech as cyberware}
    <ListItem item={cyberware} {move} {remove}>
        <Cyberware cyberware={cyberware}></Cyberware>
    </ListItem>
{/each}
