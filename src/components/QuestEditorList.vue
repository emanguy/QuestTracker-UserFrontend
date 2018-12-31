<!--suppress JSMethodCanBeStatic -->
<template>
    <div>
        <div id="known-quests" v-for="quest of questList" :key="quest.id" class="horizontal-flexbox">
            <quest-chip :quest="quest" @click.native="editQuest(quest)" :class="{'q-chip': true, 'invisible-quest': !quest.visible}"></quest-chip>
            <div class="circle accent-background vertical-flexbox material-icons" @click="deleteQuest(quest.id)">clear</div>
            <div class="circle accent-background vertical-flexbox material-icons" @click="toggleQuestVisibility(quest.id)">
                {{visibilityIcon(quest.visible)}}
            </div>
        </div>
        <div id="quest-add-button" class="dark-primary-background rounded-container" @click="newQuest()">
            <h3>+ Add New Quest</h3>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import {mixins} from "vue-class-component";
    import {Quest} from "common-interfaces";
    import QuestChip from "./QuestChip.vue";
    import QuestListInheritorMixin from "../ts/QuestListInheritorMixin";
    import AuthTokenInheritorMixin from "../ts/AuthTokenInheritorMixin";

    @Component({
        components: {QuestChip}
    })
    export default class QuestEditorList extends mixins(QuestListInheritorMixin, AuthTokenInheritorMixin) {

        visibilityIcon(questVisible: boolean) {
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
        deleteQuest(id: string) {
            console.log(`Delete quest ${id}`);
            // TODO
        }

        /**
         * Toggle visibility of quest
         *
         * @param id ID of quest to toggle visibility on
         */
        toggleQuestVisibility(id: string) {
            console.log(`Toggle visibility for quest ${id}`);
            // TODO
        }

        /**
         * Enter editor view for specific quest
         *
         * @param quest The quest to edit
         */
        editQuest(quest: Quest) {
            console.log(`Enter editor for quest ${quest.id}`);
            // TODO
        }

        /**
         * Enter editor view to create new quest
         */
        newQuest() {
            console.log("Create new quest");
            // TODO
        }
    }
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