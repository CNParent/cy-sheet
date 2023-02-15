<script>
    import Armor from './Armor.svelte';
    import Equipment from './Equipment.svelte';
    import Weapons from './Weapons.svelte';

    export let model;
    
    $:itemCount = model.weapons.length + model.equipment.length;
    $:itemCountStyle = itemCount > (model.abilities.strength + 8) * 2 ?
        'badge-danger' :
        itemCount > model.abilities.strength + 8 ?
        'badge-warning' :
        'badge-dark';
</script>

<div class="position-topright">
    <span class="badge {itemCountStyle}">{itemCount} / {model.abilities.strength + 8}</span>
</div>
<Armor model={model}></Armor>
<hr/>
<Weapons model={model}></Weapons>
<hr/>
<Equipment model={model}></Equipment>