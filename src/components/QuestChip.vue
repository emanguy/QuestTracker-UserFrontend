<template>
    <div id="container" :class="horizontalContainerClasses">
        <p>{{formattedType}} quest</p>
        <div id="horizontalContainer" class="horizontal-flexbox">
            <h3 class="title">{{quest.name}} <span v-if="totalObjectives !== 0 && completedObjectives === totalObjectives">(COMPLETE!)</span></h3>
            <span class="flex-fill"></span>
            <p class="not-on-mobile">{{completedObjectives}}/{{totalObjectives}} Objectives Complete</p>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {Objective, Quest, QuestType} from "common-interfaces/QuestInterfaces";

    @Component
    export default class QuestChip extends Vue {
        @Prop() quest!: Quest;

        get formattedType() {
            switch (this.quest.questType) {
                case QuestType.MAIN:
                    return "Main";
                case QuestType.SIDE:
                    return "Side";
                default:
                    return "Unknown Type";
            }
        }

        get completedObjectives() {
            return this.quest.objectives.reduce((completedCount: number, objective: Objective) => {
                if (objective.completed) return completedCount + 1;
                else return completedCount;
            }, 0);
        }

        get totalObjectives() {
            return this.quest.objectives.length;
        }

        get horizontalContainerClasses() {
            return {"accent-background": this.quest.questType === QuestType.MAIN, "vertical-flexbox": true, "rounded-container": true};
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";

    #container {
        transition: transform .2s;
        align-items: start;

        &:hover {
            transform: scale(1.05);
            cursor: pointer;
        }

        &:not(.accent-background) {
            background-color: white;
        }
    }

    #horizontalContainer {
        width: 100%;
        align-items: baseline;
    }
</style>