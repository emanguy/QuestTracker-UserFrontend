import {QuestType} from "common-interfaces/QuestInterfaces";
<template>
    <transition name="list-zoom">
        <div id="side-spacer">
            <span id="title-span" class="center">
                <h1 id="main-title" class="heading text-on-primary rounded-container">ACTIVE QUESTS</h1>
            </span>
            <error-box :backendError="backendError"></error-box>
            <hr>
            <div id="main-quest-container" class="vertical-flexbox" v-if="questList.length > 0">
                <quest-chip
                        v-for="quest of questList"
                        :key="quest.id"
                        :quest="quest"
                        :class="{invisibleQuest: !(quest.visible)}"
                />
            </div>
            <div id="no-quests" v-else class="rounded-container">No quests</div>
        </div>
    </transition>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import QuestChip from "../components/QuestChip.vue";
    import ErrorBox from "../components/ErrorBox.vue";
    import QuestListInheritor from "../ts/QuestListInheritor";

    @Component({
        components: {QuestChip, ErrorBox}
    })
    export default class QuestList extends QuestListInheritor {
    }
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
    #side-spacer {
        padding-left: 25%;
        padding-right: 25%;

        @include on-device-type(mobile) {
            padding-left: 0;
            padding-right: 0;
        }
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
    .list-zoom-enter, .list-zoom-leave-to {
        transform: scale(1.5);
        opacity: 0;
    }

    .list-zoom-enter-active, .list-zoom-leave-active {
        transition: transform $transitionDuration, opacity $transitionDuration;
        overflow: hidden;
        position: fixed;
        width: 50%;

        @include on-device-type(mobile) {
            width: calc(100% - 16px); // HTML body adds 8px margin
        }
    }
</style>
