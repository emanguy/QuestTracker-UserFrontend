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
                :quest-to-edit="selectedQuest"
                :edit-mode="editMode"
                @edit-quest="editQuest"
                @add-quest="addQuest"
                @editor-exit="backToList"
        ></component>
    </div>
</template>

<script lang="ts">
    import {defineComponent, ref, Ref} from "vue";
    import {Quest} from "common-interfaces";
    import QuestEditorAddUpdate from "./QuestEditorAddUpdate.vue";
    import QuestEditorList from "./QuestEditorList.vue";
    import {EditorMode} from "../ts/EditorBehavior";

    enum EditorViewState {
        LIST = "QuestEditorList",
        EDIT = "QuestEditorAddUpdate"
    }

    export default defineComponent({
        components: {QuestEditorList, QuestEditorAddUpdate},
        setup(_, { emit }) {
            const currentEditorView: Ref<EditorViewState> = ref(EditorViewState.LIST);
            const editMode: Ref<EditorMode> = ref(EditorMode.ADD);
            const selectedQuest: Ref<Quest|null> = ref(null);

            function editQuest(quest: Quest) {
                selectedQuest.value = quest;
                editMode.value = EditorMode.UPDATE;
                currentEditorView.value = EditorViewState.EDIT;
            }

            function addQuest() {
                selectedQuest.value = null;
                editMode.value = EditorMode.ADD;
                currentEditorView.value = EditorViewState.EDIT;
            }

            function backToList() {
                selectedQuest.value = null;
                currentEditorView.value = EditorViewState.LIST;
            }

            function logout() {
                selectedQuest.value = null;
                currentEditorView.value = EditorViewState.LIST;
                emit("logout-request");
            }

            return {
                currentEditorView,
                editMode,
                selectedQuest,

                editQuest,
                addQuest,
                backToList,
                logout,
            };
        }
    })
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
