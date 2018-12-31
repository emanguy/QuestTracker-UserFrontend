<template>
    <div>
        <h3>Wew look a quest list wew</h3>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import {ApiCredentials} from "../ts/BackendConnector";
    import QuestListInheritor from "../ts/QuestListInheritor";

    @Component
    export default class AdminQuestList extends QuestListInheritor {
        @Prop({default: null}) apiCreds!: ApiCredentials;
    }
</script>

<style scoped lang="scss">

</style>