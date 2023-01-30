<script>
    import app from './../models/app.js'
    import AppPower from "./AppPower.svelte";
    import ListItem from "./ListItem.svelte";

    export let model;

    function add() {
        model.apps.push(app())
        model.apps = model.apps;
    }

    function move(n, item) {
        let index = model.apps.indexOf(item);
        model.apps.splice(index, 1);

        index += n;
        if (index < 0) index = model.apps.length;
        else if (index > model.apps.length) index = 0;

        model.apps.splice(index, 0, item);
        model.apps = model.apps;
    }

    function remove(item) {
        let index = model.apps.indexOf(item);
        model.apps.splice(index, 1);
        model.apps = model.apps;
    }

</script>

<button on:click={add} class="btn btn-dark">Add</button>
{#each model.apps as app}
    <ListItem item={app} {move} {remove}>
        <AppPower app={app}></AppPower>
    </ListItem>
{/each}
