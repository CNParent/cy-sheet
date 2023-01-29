<script>
    import Abilities from "./Abilities.svelte";
    import HitPoints from "./HitPoints.svelte";

    export let model;
</script>


<HitPoints hp={model.hp}></HitPoints>
<hr/>
<Abilities model={model}></Abilities>
