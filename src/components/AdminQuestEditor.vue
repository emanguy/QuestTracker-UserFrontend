import {EditorMode} from "../ts/EditorBehavior";
import {EditorMode} from "../ts/EditorBehavior";
import {EditorMode} from "../ts/EditorBehavior";
<template>
    <div>
        <div class="center">
            <h1 id="editTitle" class="primary-color-background rounded-container ">Edit Quests</h1>
            <br>
            <h2 id="logoutBtn" class="rounded-container" @click="logout">Log out</h2>
        </div>
        <hr>
        <component
                :is="currentEditorView"
                :quest-list="questList"
                :auth-token="authToken"
                :quest-to-edit="selectedQuest"
                :edit-mode="editMode"
                @edit-quest="editQuest"
                @add-quest="addQuest"
                @editor-exit="backToList"
        ></component>
    </div>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import QuestListInheritorMixin from "../ts/QuestListInheritorMixin";
    import {Quest} from "common-interfaces";
    import {mixins} from "vue-class-component";
    import AuthTokenInheritorMixin from "@/ts/AuthTokenInheritorMixin";
    import QuestEditorAddUpdate from "@/components/QuestEditorAddUpdate.vue";
    import QuestEditorList from "./QuestEditorList.vue";
    import {EditorMode} from "@/ts/EditorBehavior";

    enum EditorViewState {
        LIST = "QuestEditorList",
        EDIT = "QuestEditorAddUpdate"
    }

    @Component({
        components: {QuestEditorList, QuestEditorAddUpdate}
    })
    export default class AdminQuestEditor extends mixins(QuestListInheritorMixin, AuthTokenInheritorMixin) {
        currentEditorView: EditorViewState = EditorViewState.LIST;
        editMode: EditorMode = EditorMode.ADD;
        selectedQuest: Quest|null = null;

        editQuest(quest: Quest) {
            this.selectedQuest = quest;
            this.editMode = EditorMode.UPDATE;
            this.currentEditorView = EditorViewState.EDIT;
        }

        addQuest() {
            this.selectedQuest = null;
            this.editMode = EditorMode.ADD;
            this.currentEditorView = EditorViewState.EDIT;
        }

        backToList() {
            this.selectedQuest = null;
            this.currentEditorView = EditorViewState.LIST;
        }

        logout() {
            this.selectedQuest = null;
            this.currentEditorView = EditorViewState.LIST;
            this.$emit("logout-request");
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";
    @import "../assets/MouseHoverMixin";

    #editTitle {
        display: inline-block;
    }

    #logoutBtn {
        @include hover-animation();

        display: inline-block;
        background-color: white;
    }

</style>