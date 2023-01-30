<script>
    export let score;

    function handleClick(e) {
        score += e.shiftKey ? -1 : 1;
        if (score < -3) score = 3;
        if (score > 3) score = -3;
    }

    $:scoreText = score > 0 ? `+${score}` : `${score}`;
</script>

<div class="d-flex">
    <h4><button class="btn btn-dark badge" style="width: 2.0em" on:click={handleClick}>{scoreText}</button></h4>
    <span class="align-self-center ml-1"><slot></slot></span>
</div>