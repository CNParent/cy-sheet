<script>
    import listActions from '../lib/listActions.js';
    import ListItem from './ListItem.svelte';
    import Weapon from './Weapon.svelte';
    import weapon from '../models/weapon.js';

    export let model;
    export let update;
    
    function addWeapon() {
        model.weapons.push(weapon())
        model.weapons = model.weapons;
        update();
    }

    function moveWeapon(n, weapon) {
        listActions.move(model.weapons, n, weapon);
        model.weapons = model.weapons;
    }

    function removeWeapon(weapon) {
        listActions.remove(model.weapons, weapon);
        model.weapons = model.weapons;
        update();
    }
</script>

<div class="d-flex align-items-end">
    <span>Weapons</span>
    <button on:click={addWeapon} class="ml-auto btn btn-dark">Add</button>
</div>
{#each model.weapons as weapon}
    <ListItem item={weapon} move={moveWeapon} remove={removeWeapon}>
        <Weapon weapon={weapon}></Weapon>
    </ListItem>
{/each}
