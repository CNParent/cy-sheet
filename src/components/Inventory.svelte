<script>
    import Armor from './Armor.svelte';
    import Equipment from './Equipment.svelte';
    import Weapons from './Weapons.svelte';

    export let model;

    model.equipment = model.equipment.map(i => {
        if (typeof(i) != 'string') return i;

        return { name: i, size: 1 };
    })

    function update() {
        model = model;
    }
    
    $:itemCount = model.weapons.length + model.equipment.reduce((a,b) => a + b.size, 0);
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
<Weapons model={model} update={update}></Weapons>
<hr/>
<Equipment model={model} update={update}></Equipment>