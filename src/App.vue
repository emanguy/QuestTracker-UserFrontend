<template>
    <div id="app">
        <header class="horizontal-flexbox">
            <router-link class="no-link-decor" :to="{ name: 'questList' }">
                <h3>Quest Tracker</h3>
            </router-link>
            <div class="flex-fill"></div>
            <router-link :to="{ name: 'adminPage' }">
                <h3>DM Login</h3>
            </router-link>
        </header>

        <router-view v-slot="{ Component, route }">
            <keep-alive>
                <component :is="Component"></component>
            </keep-alive>
        </router-view>
    </div>
</template>

<script lang="ts">
    import {defineComponent, ref, provide, onMounted, Ref, PropType} from 'vue';
    import {Quest} from "common-interfaces/QuestInterfaces";
    import {getFullQuestList, QuestUpdateListener} from "./ts/BackendConnector";
    import {patchQuestListOnAdd, patchQuestListOnDelete, patchQuestListOnUpdate} from "./ts/QuestListPatcher";
    import {QUEST_LIST_KEY, BACKEND_ERROR_KEY} from "./composition/QuestListInheritor";

    export default defineComponent({
        props: {
            retrieveQuestsMethod: {
                type: Function as PropType<() => Promise<Array<Quest>> >,
                default: getFullQuestList,
            },
            backendUpdateListener: {
                type: Object as PropType<QuestUpdateListener>,
                default: () => new QuestUpdateListener(),
            }
        },

        setup(props) {
            let questList = ref<Array<Quest>>([]);
            let backendError: Ref<Error|null> = ref(null);

            provide(QUEST_LIST_KEY, questList);
            provide(BACKEND_ERROR_KEY, backendError);

            let badResponseRetries: Ref<number> = ref(0);

            function refetchQuestListOrErrorOut(err: Error) {
                console.log(err);
                badResponseRetries.value = badResponseRetries.value + 1;

                if (badResponseRetries.value < 5) {
                    console.log(`Bad response #${badResponseRetries.value}, trying again.`);
                    stopListeningForUpdates();
                    setUpQuestList();
                }
                else {
                    console.log("Retry limit reached. Displaying error message.");
                    backendError.value = err;
                }
            }

            async function setUpQuestList() {
                let listFromServer: Array<Quest>;

                try {
                    listFromServer = await props.retrieveQuestsMethod();
                    questList.value = listFromServer;
                    props.backendUpdateListener.startListening();
                    badResponseRetries.value = 0;
                } catch(err) {
                    refetchQuestListOrErrorOut(err);
                    return;
                }
            }

            function stopListeningForUpdates() {
                if (props.backendUpdateListener?.isListening) {
                    props.backendUpdateListener.stopListening();
                }
            }

            function initializeListeners() {
                props.backendUpdateListener.createEventListeners.push(update => patchQuestListOnAdd(update, questList.value));
                props.backendUpdateListener.updateEventListeners.push(update => patchQuestListOnUpdate(update, questList.value));
                props.backendUpdateListener.deleteEventListeners.push(update => patchQuestListOnDelete(update, questList.value));
                props.backendUpdateListener.errorEventListeners.push(err => refetchQuestListOrErrorOut(err));

                setUpQuestList();
            }
            onMounted(() => initializeListeners());


            return {
                questList,
                backendError,
                badResponseRetries,
            };
        }
    });
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
