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
import {computed, defineComponent, PropType} from "vue";
    import {Objective, Quest, QuestType} from "common-interfaces/QuestInterfaces";

    export default defineComponent({
        props: {
            quest: {
                type: Object as PropType<Quest>,
                required: true,
            }
        },

        setup(props) {
            const formattedType = computed( () => {
                switch (props.quest.questType) {
                    case QuestType.MAIN:
                        return "Main";
                    case QuestType.SIDE:
                        return "Side";
                    default:
                        return "Unknown Type";
                }
            })

            const completedObjectives = computed( () => {
                return props.quest.objectives.reduce((completedCount: number, objective: Objective) => {
                    if (objective.completed) return completedCount + 1;
                    else return completedCount;
                }, 0);
            });

            const totalObjectives = computed(() => {
                return props.quest.objectives.length;
            });

            const horizontalContainerClasses = computed( () => {
                return {"accent-background": props.quest.questType === QuestType.MAIN, "vertical-flexbox": true, "rounded-container": true};
            });

            return { formattedType, completedObjectives, totalObjectives, horizontalContainerClasses };
        }
    });
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";
    @import "../assets/MouseHoverMixin";

    #container {
        @include hover-animation();

        align-items: start;

        &:not(.accent-background) {
            background-color: white;
        }
    }

    #horizontalContainer {
        width: 100%;
        align-items: baseline;
    }
</style>
