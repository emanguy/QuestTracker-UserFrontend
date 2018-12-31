<template>
    <div>
        <div class="center">
            <h1 id="editTitle" class="primary-color-background rounded-container ">Edit Quests</h1>
        </div>
        <hr>
        <component :is="currentEditorView" :quest-list="questList"></component>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import QuestEditorList from "./QuestEditorList.vue";
    import {ApiCredentials} from "../ts/BackendConnector";
    import QuestListInheritorMixin from "../ts/QuestListInheritorMixin";
    import {mixins} from "vue-class-component";


    @Component({
        components: {QuestEditorList}
    })
    export default class AdminQuestEditor extends mixins(QuestListInheritorMixin) {
        @Prop({default: null}) apiCreds!: ApiCredentials;
        currentEditorView: string = "QuestEditorList";

    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";
    @import "../assets/MouseHoverMixin";

    #editTitle {
        display: inline-block;
    }

</style>