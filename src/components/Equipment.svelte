<script>
    import Item from "./Item.svelte";
    import ListItem from "./ListItem.svelte";
    import listActions from "../lib/listActions.js";

    export let model;

    function addEquipment() {
        model.equipment.push('');
        model.equipment = model.equipment;
    }

    function moveEquipment(n, item) {
        listActions.move(model.equipment, n, item);
        model.equipment = model.equipment;
    }

    function removeEquipment(item) {
        listActions.remove(model.equipment, item);
        model.equipment = model.equipment;
    }
</script>

<div class="d-flex align-items-end">
    <span>Equipment</span>
    <button on:click={addEquipment} class="ml-auto btn btn-dark">Add</button>
</div>
{#each model.equipment as item}
    <ListItem item={item} move={moveEquipment} remove={removeEquipment}>
        <Item bind:item={item}></Item>
    </ListItem>
{/each}
