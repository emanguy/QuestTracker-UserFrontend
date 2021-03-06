<template>
    <transition name="zoom-transition">
        <div id="page">
            <div v-if="backendError == null" id="about" class="margined rounded-container">
                <!-- Page title -->
                <h1>{{selectedQuest.name}} &#x2014; Details</h1>
                <!-- Content flexbox -->
                <div id="content-container" class="horizontal-flexbox">
                    <!-- Container for quest objectives and source region -->
                    <div id="quest-metadata" class="padded">
                        <h2 class="section-heading">Objectives</h2>
                        <ul v-if="selectedQuest.objectives.length > 0" class="checklist">
                            <li v-for="objective of selectedQuest.objectives" :key="objective.id" :class="{checked: objective.completed}">{{objective.text}}</li>
                        </ul>
                        <p id="no-objective-label" v-else>None</p>
                        <p><i class="material-icons">place</i><b>SOURCE REGION:</b> {{selectedQuest.sourceRegion}}</p>
                    </div>
                    <!-- Container for quest description -->
                    <div class="padded">
                        <h2 class="section-heading">Quest Description</h2>
                        <p v-for="line of questDescriptionLines">{{line}}<br></p>
                    </div>
                </div>
            </div>
            <error-box class="margined" :backendError="backendError"></error-box>
        </div>
    </transition>
</template>

<script lang="ts">
    import { useQuestListInheritor } from "../composition/QuestListInheritor";
    import {Quest, QuestType} from "common-interfaces/QuestInterfaces";
    import ErrorBox from "../components/ErrorBox.vue";
    import {defineComponent, computed} from "vue";
    import {useRoute} from "vue-router";

    export default defineComponent({
        components: { ErrorBox },
        setup() {
            const defaultQuest: Quest = {
                id: "undefined",
                visible: true,
                name: "undefined",
                sourceRegion: "undefined",
                questType: QuestType.MAIN,
                objectives: [],
                description: "undefined"
            };

            const { questList, backendError } = useQuestListInheritor();
            const route = useRoute();
            const selectedQuest = computed(() =>
                questList.value.find(quest => quest.id === route.params["questId"]) ?? defaultQuest
            );

            /**
             * Splits the quest description by LF characters so the description actually appears in paragraphs as intended
             */
            const questDescriptionLines = computed(() => selectedQuest.value.description.split("\n"));

            return { questList, backendError, selectedQuest, questDescriptionLines };
        }
    });
</script>

<style scoped lang="scss">
  @import "../assets/CommonStyles";
  @import "../assets/ResponsiveMixin";

  /* Main stylings */
  #about {
      background: white;
  }

  .margined {
      margin-left: 10%;
      margin-right: 10%;

      @include on-device-type(mobile) {
          margin-left: 8px;
          margin-right: 8px;
      }
  }

  #no-objective-label {
      margin-bottom: 16px;
  }

  #content-container {
      @include on-device-type(mobile) {
          flex-direction: column;
      }
  }

  #quest-metadata {
      max-width: 33%;
      border-right: 2px solid $themeAccentColor;

      @include on-device-type(mobile) {
          max-width: none;
          border-right: none;
          border-bottom: 2px solid $themeAccentColor;
      }
  }

  /* CSS transitions for above transition element */
  .zoom-transition-enter-from, .zoom-transition-leave-to {
      opacity: 0;
      transform: scale(0.5);
  }

  .zoom-transition-enter-active, .zoom-transition-leave-active {
      transition: opacity $transitionDuration, transform $transitionDuration;
      overflow: hidden;
      position: fixed;
      box-sizing: border-box;
      width: 100%;

      @include on-device-type(mobile) {
          width: calc(100% - 16px); // Body adds 8px margin
      }
  }
</style>
