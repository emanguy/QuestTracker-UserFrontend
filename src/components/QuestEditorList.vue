<!--suppress JSMethodCanBeStatic -->
<template>
    <div>
        <div id="known-quests" v-for="quest of questList" :key="quest.id" class="horizontal-flexbox">
            <quest-chip :quest="quest" @click.native="editQuest(quest)" :class="{'q-chip': true, 'invisible-quest': !quest.visible}"></quest-chip>
            <div class="circle accent-background vertical-flexbox material-icons" @click="triggerDeleteQuest(quest.id)">clear</div>
            <div class="circle accent-background vertical-flexbox material-icons" @click="toggleQuestVisibility(quest.id, quest.visible)">
                {{visibilityIcon(quest.visible)}}
            </div>
        </div>
        <div id="quest-add-button" class="dark-primary-background rounded-container" @click="newQuest()">
            <h3>+ Add New Quest</h3>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from "vue";
    import {Quest} from "common-interfaces";
    import QuestChip from "./QuestChip.vue";
    import { useQuestListInheritor } from "../composition/QuestListInheritor";
    import { useAuthTokenInheritor } from "../composition/AuthTokenInheritor";
    import {deleteQuest, modifyQuest} from "../ts/BackendConnector";
    import {assertExists} from "../ts/Assertions";

    export default defineComponent({
        components: { QuestChip },

        setup(_, { emit }) {
            const { authToken } = useAuthTokenInheritor();
            const { questList } = useQuestListInheritor();

            function visibilityIcon(questVisible: boolean) {
                if (questVisible) {
                    return "visibility"
                }
                else {
                    return "visibility_off";
                }
            }

            /**
             * Delete specific quest
             *
             * @param id ID of the quest to delete
             */
            async function triggerDeleteQuest(id: string) {
                console.log(`Delete quest ${id}`);

                try {
                    await deleteQuest(assertExists(authToken.value), id);
                }
                catch (e) {
                    emit("backend-error", e);
                }
            }

            /**
             * Toggle visibility of quest
             *
             * @param id ID of quest to toggle visibility on
             * @param currentlyVisible True if the quest is currently visible
             */
            async function toggleQuestVisibility(id: string, currentlyVisible: boolean) {
                console.log(`Toggle visibility for quest ${id}`);

                try {
                    await modifyQuest(assertExists(authToken.value), id, {visible: !currentlyVisible});
                }
                catch (e) {
                    emit("backend-error", e);
                }
            }

            /**
             * Enter editor view for specific quest
             *
             * @param quest The quest to edit
             */
            function editQuest(quest: Quest) {
                console.log(`Enter editor for quest ${quest.id}`);
                emit("edit-quest", quest);
            }

            /**
             * Enter editor view to create new quest
             */
            function newQuest() {
                console.log("Create new quest");
                emit("add-quest");
            }

            return {
                questList,

                visibilityIcon,
                triggerDeleteQuest,
                toggleQuestVisibility,
                editQuest,
                newQuest,
            }
        }
    })
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";
    @import "../assets/MouseHoverMixin";

    #quest-add-button {
        @include hover-animation();
    }

    .invisible-quest {
        opacity: 0.8;
    }

    .horizontal-flexbox {
        justify-content: space-evenly;
        align-items: center;
    }

    .q-chip {
        width: 75%;
    }

    .circle {
        @include hover-animation();

        $size: 50px;

        width: $size;
        height: $size;
        border-radius: $size / 2;
        justify-content: center;
        align-items: center;
    }

    #known-quests > div {
        margin-bottom: 8px;
    }
</style>
