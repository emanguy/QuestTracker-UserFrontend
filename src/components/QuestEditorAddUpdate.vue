<template>
    <div id="container" class="rounded-container">
        <h3></h3>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";

    @Component
    export default class QuestEditorAddUpdate extends Vue {

    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";

    #container {
        background-color: white;
    }
</style>