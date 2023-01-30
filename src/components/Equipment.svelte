<script>
    import Item from './Item.svelte';
    import ListItem from './ListItem.svelte';
    import weapon from './../models/weapon.js';
    import Weapon from './Weapon.svelte';

    export let model;

    function addWeapon() {
        model.weapons.push(weapon())
        model.weapons = model.weapons;
    }

    function addEquipment() {
        model.equipment.push('');
        model.equipment = model.equipment;
    }

    function moveEquipment(n, item) {
        move(model.equipment, n, item);
        model.equipment = model.equipment;
    }

    function moveWeapon(n, weapon) {
        move(model.weapons, n, weapon);
        model.weapons = model.weapons;
    }

    function move(collection, n, item) {
        let index = collection.indexOf(item);
        collection.splice(index, 1);

        index += n;
        if (index < 0) index = collection.length;
        else if (index > collection.length) index = 0;

        collection.splice(index, 0, item);
        collection = collection;
    }

    function removeEquipment(item) {
        remove(model.equipment, item);
        model.equipment = model.equipment;
    }

    function removeWeapon(weapon) {
        remove(model.weapons, weapon);
        model.weapons = model.weapons;
    }

    function remove(collection, item) {
        let index = collection.indexOf(item);
        collection.splice(index, 1);
        collection = collection;
    }
    
    $:itemCount = model.weapons.length + model.equipment.length;
</script>

<div class="d-flex">
    <button on:click={addWeapon} class="ml-auto btn btn-dark">Add Weapon</button>
    <button on:click={addEquipment} class="ml-1 btn btn-dark">Add Equipment</button>
    <span class="position-topright badge align-self-center">{itemCount} / {model.abilities.strength + 8}</span>
</div>
<hr/>
<span>Weapons</span>
{#each model.weapons as weapon}
    <ListItem item={weapon} move={moveWeapon} remove={removeWeapon}>
        <Weapon weapon={weapon}></Weapon>
    </ListItem>
{/each}
<hr/>
<span>Equipment</span>
{#each model.equipment as item}
    <ListItem item={item} move={moveEquipment} remove={removeEquipment}>
        <Item bind:item={item}></Item>
    </ListItem>
{/each}