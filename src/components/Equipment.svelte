<script>
    import { afterUpdate } from 'svelte';

    import Item from './Item.svelte';
    import ListItem from './ListItem.svelte';
    import weapon from './../models/weapon.js';
    import Weapon from './Weapon.svelte';

    export let model;

    const armorValues = ['-', '-d2', '-d4', '-d6'];

    let isEditingArmor;

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
    $:itemCountStyle = itemCount > (model.abilities.strength + 8) * 2 ?
        'badge-danger' :
        itemCount > model.abilities.strength + 8 ?
        'badge-warning' :
        'badge-dark';


    let armorControl;
    afterUpdate(() => {
        if (armorControl) armorControl.focus();
    });
</script>

<div class="position-topright">
    <span class="badge  {itemCountStyle}">{itemCount} / {model.abilities.strength + 8}</span>
</div>
<span>Armor</span>
<div class="d-flex mb-1">
    {#if isEditingArmor}
        <input bind:this={armorControl} class="form-control flex-grow-1" bind:value={model.armor}>
        <div class="pl-1 pr-1">
            <select class="form-control" bind:value={model.armorValue}>
                {#each armorValues as a}
                    <option value={a}>{a}</option>
                {/each}
            </select>
        </div>
        <button on:click={() => isEditingArmor = false} class="btn btn-light ml-1">Done</button>
    {:else}
        <button on:click={() => isEditingArmor = true} class="btn btn-dark text-left flex-grow-1">{model.armor}</button>
        <button on:click={() => isEditingArmor = true} class="btn btn-dark text-left ml-1">{model.armorValue}</button>
    {/if}
</div>
<hr/>
<div class="d-flex align-items-end">
    <span>Weapons</span>
    <button on:click={addWeapon} class="ml-auto btn btn-dark">Add</button>
</div>
{#each model.weapons as weapon}
    <ListItem item={weapon} move={moveWeapon} remove={removeWeapon}>
        <Weapon weapon={weapon}></Weapon>
    </ListItem>
{/each}
<hr/>
<div class="d-flex align-items-end">
    <span>Equipment</span>
    <button on:click={addEquipment} class="ml-auto btn btn-dark">Add</button>
</div>
{#each model.equipment as item}
    <ListItem item={item} move={moveEquipment} remove={removeEquipment}>
        <Item bind:item={item}></Item>
    </ListItem>
{/each}