<script>
    import Abilities from "./Abilities.svelte";
    import Glitches from "./Glitches.svelte";
    import HitPoints from "./HitPoints.svelte";

    export let model;
</script>


<HitPoints hp={model.hp}></HitPoints>
<Glitches glitches={model.glitches}></Glitches>
<hr />
<Abilities model={model}></Abilities>
