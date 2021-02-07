<template>
    <transition name="list-zoom">
        <div class="side-spacer">
            <span id="title-span" class="center">
                <h1 id="main-title" class="heading dark-primary-background rounded-container">ACTIVE QUESTS</h1>
            </span>
            <error-box :backendError="backendError"></error-box>
            <hr>
            <div id="main-quest-container" class="vertical-flexbox" v-if="!noQuestsVisible">
                <router-link
                        v-for="quest of questList"
                        :key="quest.id"
                        :class="{invisibleQuest: !(quest.visible), 'no-link-decor': true}"
                        :to="{ name: 'questDetail', params: { questId: quest.id }}"
                >
                    <quest-chip :quest="quest"/>
                </router-link>
            </div>
            <div id="no-quests" v-else class="rounded-container">No quests</div>
        </div>
    </transition>
</template>

<script lang="ts">
    import QuestChip from "../components/QuestChip.vue";
    import ErrorBox from "../components/ErrorBox.vue";
    import { useQuestListInheritor } from "../composition/QuestListInheritor";
    import {Quest} from "common-interfaces";
    import {computed, defineComponent} from "vue";

    export default defineComponent({
        components: { QuestChip, ErrorBox },
        setup() {
            const { questList, backendError } = useQuestListInheritor();

            /**
             * Returns true if there are no quests in the quest list or none are visible.
             */
            const noQuestsVisible = computed(() =>
                    questList.value.length === 0 || questList.value.reduce((prevValue: boolean, currentValue: Quest) => prevValue && !currentValue.visible, true)
            );

            return { questList, backendError, noQuestsVisible };
        }
    });
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";
    @import "../assets/ResponsiveMixin";

    /* Generic stylings */
    #title-span {
        display: block;
    }
    #main-title {
        display: inline-block;
        background-color: $themePrimaryColorDark;
    }

    #main-quest-container {
        justify-content: center;

        * {
            margin-right: 8px;
            margin-bottom: 8px;
        }
    }
    #no-quests {
        background: white;
    }

    .invisibleQuest {
        display: none;
    }

    /* CSS transition for the above transition element */
    .list-zoom-enter-from, .list-zoom-leave-to {
        transform: scale(1.5);
        opacity: 0;
    }

    .list-zoom-enter-active, .list-zoom-leave-active {
        transition: transform $transitionDuration, opacity $transitionDuration;
        overflow: hidden;
        position: fixed;
        box-sizing: border-box;
        width: 100%;

        @include on-device-type(mobile) {
            width: calc(100% - 16px); // HTML body adds 8px margin
        }
    }
</style>
