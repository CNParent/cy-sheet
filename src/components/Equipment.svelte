<script>
    import weapon from './../models/weapon.js';

    export let model;

    function move(collection) {
        return function(item, n) {
            let index = collection.indexOf(item);
            collection.splice(index, 1);

            index += n;
            if (index < 0) index = collection.length;
            else if (index > collection.length) index = 0;

            collection.splice(index, 0, item);
            collection = collection;
        }
    }
    
    $:itemCount = model.weapons.length + model.equipment.length;
</script>

<div class="d-flex">
    <button on:click={() => model.weapons.push(weapon())} class="ml-auto btn btn-dark">Add Weapon</button>
    <button on:click={() => model.equipment.push('')} class="ml-1 btn btn-dark">Add Equipment</button>
    <span class="position-topright badge align-self-center">{itemCount} / {model.abilities.strength + 8}</span>
</div>
<hr/>
<span>Weapons</span>
{#each model.weapons as weapon}
{/each}
<hr/>
<span>Equipment</span>
{#each model.equipment as item}
{/each}