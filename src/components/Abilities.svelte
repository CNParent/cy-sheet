<script>
    import Ability from "./Ability.svelte";

    export let model;
</script>

<Ability bind:score={model.abilities.strength}>Strength</Ability>
<Ability bind:score={model.abilities.agility}>Agility</Ability>
<Ability bind:score={model.abilities.presence}>Presence</Ability>
<Ability bind:score={model.abilities.toughness}>Toughness</Ability>
<Ability bind:score={model.abilities.knowledge}>Knowledge</Ability>
