<template>
  <div id="app">
    <router-view :questList="questList" :backendError="backendError"/>
  </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator";
    import { Quest } from "common-interfaces/QuestInterfaces";
    import {getFullQuestList, QuestUpdateListener} from "./ts/BackendConnector";
    import {patchQuestListOnAdd, patchQuestListOnDelete, patchQuestListOnUpdate} from "./ts/QuestListPatcher";

    @Component
    export default class MainAppComponent extends Vue {
        questList: Quest[] = [];
        backendError: Error|null = null;
        badResponseRetries: number = 0;
        backendUpdateListener: QuestUpdateListener = new QuestUpdateListener();
        retrieveQuestsMethod: () => Promise<Quest[]> = getFullQuestList;

        mounted() {
            this.initializeListeners()
        }

        initializeListeners() {
            this.backendUpdateListener.createEventListeners.push(update => patchQuestListOnAdd(update, this.questList));
            this.backendUpdateListener.updateEventListeners.push(update => patchQuestListOnUpdate(update, this.questList));
            this.backendUpdateListener.deleteEventListeners.push(update => patchQuestListOnDelete(update, this.questList));
            this.backendUpdateListener.errorEventListeners.push(err => this.refetchQuestListOrErrorOut(err));

            this.setUpQuestList();
        }

        setUpQuestList() {
            this.retrieveQuestsMethod()
                .then((listFromServer) => {
                    this.questList = listFromServer;
                    this.backendUpdateListener.startListening();
                    this.badResponseRetries = 0;
                })
                .catch((err) => this.refetchQuestListOrErrorOut(err));
        }

        stopListeningForUpdates() {
            if (this.backendUpdateListener != null && this.backendUpdateListener.isListening) {
                this.backendUpdateListener.stopListening();
            }
        }

        refetchQuestListOrErrorOut(err: Error) {
            console.log(err);
            this.badResponseRetries = this.badResponseRetries + 1;

            if (this.badResponseRetries < 5) {
                console.log(`Bad response #${this.badResponseRetries}, trying again.`);
                this.stopListeningForUpdates();
                this.setUpQuestList();
            }
            else {
                console.log("Retry limit reached. Displaying error message.");
                this.backendError = err;
            }
        }
    }
</script>

<style lang="scss">
    @import "./assets/CommonStyles.scss";

    html {
        background: url("./assets/Aragashion-Overworld 20x30_bg.jpg") no-repeat center center fixed;
        background-size: cover;
        font-family: $standardFont;
        overflow-x: hidden;
        height: 100vh;
    }
</style>
