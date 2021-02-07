<template>
    <div id="container" class="rounded-container">
        <h3>
            <span @click="backToListNoSave" class="material-icons button">arrow_back</span>
            {{editorTitle}}
        </h3>
        <form @submit.prevent="backToListAndSave">
            <div class="horizontal-flexbox">
                <label>
                    Quest name: <input ref="nameInput" required>
                </label>
                <input type="button" v-if="editMode === editorMode.UPDATE" value="Update" @click="updateName"/>
            </div>
            <label>
                Visible:
                <input type="checkbox" ref="visibilityCheck" value="visible" @click="updateVisible">
            </label>
            <br>
            <label>
                Type:
                <select ref="typeSelect" @input="updateType">
                    <option value="main">Main Quest</option>
                    <option value="side">Side Quest</option>
                </select>
            </label>
            <div class="horizontal-flexbox">
                <label>
                    Source Region: <input type="text" ref="regionInput" required>
                </label>
                <input type="button" v-if="editMode === editorMode.UPDATE" value="Update" @click="updateSourceRegion">
            </div>
            <div>
                <label>
                    Description: <textarea id="descriptionBox"  maxlength="3000" ref="descriptionInput"></textarea>
                </label>
                <input type="button" v-if="editMode === editorMode.UPDATE" value="Update" @click="updateDescription">
            </div>
            <div class="vertical-flexbox border">
                <h4>Objectives:</h4>
                <div v-for="objective of objectivesList" :key="objective.id">
                    <span class="material-icons cancel button" @click="deleteObjectiveFromInterface(objective)">cancel</span>
                    <input type="checkbox" v-model="objective.completed" title="Objective Completion" @click="updateObjectiveComplete(objective)">
                    <input type="text" v-model="objective.text" required>
                    <input type="button" v-if="editMode === editorMode.UPDATE" value="Update Title" @click="updateObjectiveText(objective)">
                </div>
                <div>
                    <label>
                        Add Objective: <input ref="objectiveTitleInput" placeholder="Objective Title">
                    </label>
                    <input type="button" value="Add Objective" @click="addObjective">
                </div>
            </div>
            <input type="submit" v-if="editMode === editorMode.ADD">
        </form>
    </div>
</template>

<script lang="ts">
import {Objective, Quest, QuestType} from "common-interfaces";
import {useAuthTokenInheritor} from "../composition/AuthTokenInheritor";
import {createEditorBehavior, EditorBehavior, EditorMode} from "../ts/EditorBehavior";
import {computed, defineComponent, onMounted, PropType, ref, Ref} from "vue";

type FormInputs = {
    nameInput: Ref<HTMLInputElement|null>
    visibilityCheck: Ref<HTMLInputElement|null>
    typeSelect: Ref<HTMLSelectElement|null>
    regionInput: Ref<HTMLInputElement|null>
    descriptionInput: Ref<HTMLInputElement|null>
    objectiveTitleInput: Ref<HTMLInputElement|null>
}

export default defineComponent({
    props: {
        questToEdit: Object as PropType<Quest>,
        editMode: {
            type: String as PropType<EditorMode>,
            required: true,
        },
    },

    setup(props, { emit }) {
        let behavior: EditorBehavior|null = null;
        const { authToken } = useAuthTokenInheritor();
        const formInputs: FormInputs = {
            nameInput: ref(null),
            visibilityCheck: ref(null),
            typeSelect: ref(null),
            regionInput: ref(null),
            descriptionInput: ref(null),
            objectiveTitleInput: ref(null),
        };
        let objectivesList: Ref<Array<Objective>> = ref([]);

        const editorTitle = computed(() => {
            switch (props.editMode) {
                case EditorMode.ADD:
                    return "New Quest";
                case EditorMode.UPDATE:
                    return "Update Quest";
                default:
                    return "ERROR";
            }
        });
        const editorMode = ref(EditorMode);

        /**
         * Fires an event to request going back to the list page without attempting to save anything
         */
        function backToListNoSave() {
            emit("editor-exit");
        }
        /**
         * Attempts to save changes to the backend then fires an event to request a return to the list page
         */
        async function backToListAndSave() {
            const behaviorInputPromises: Promise<any>[] = [];

            if (behavior === null) {
                throw new Error('Behavior was never configured!');
            }

            behaviorInputPromises.push(behavior.setName(formInputs.nameInput.value?.value ?? "No Name"));
            behaviorInputPromises.push(behavior.setSourceRegion(formInputs.regionInput.value?.value ?? "No Region"));
            behaviorInputPromises.push(behavior.setDescription(formInputs.descriptionInput.value?.value ?? "No Description"));
            objectivesList.value.forEach((objective) => {
                if (objective.text.length > 0) {
                    behaviorInputPromises.push(behavior?.updateObjectiveText(objective.id, objective.text) ?? Promise.resolve())
                }
                else {
                    return; // The required attribute should show an error, so just return and don't allow the complete
                }
            });

            await Promise.all(behaviorInputPromises);
            await behavior.complete();
            emit("editor-exit");
        }


        /**
         * Returns true if the text box specified is filled with text. Marks textbox invalid if not.
         *
         * @param element The text box to validate
         * @return Whether or not the input was filled
         */
        function checkFilledAndMarkInvalidOtherwise(element: HTMLInputElement): boolean {
            const inputFilled = element.value.length > 0;

            if (inputFilled) element.setCustomValidity("");
            else element.setCustomValidity("Fill this please");

            return inputFilled;
        }

        /**
         * Helps unwrap inputs by throwing an error if a ref is accessed too early.
         */
        function earlyCheck<T>(value: T|null): T {
            if (value === null) {
                throw new Error('Tried to enter input too early');
            }

            return value;
        }

        /**
         * Invoked when the "update" button next to the name field is clicked, persisting changes to the backend
         */
        async function updateName() {
            const input = earlyCheck(formInputs.nameInput.value);

            if (checkFilledAndMarkInvalidOtherwise(input)) {
                return earlyCheck(behavior).setName(input?.value);
            }
        }

        /**
         * Updates visibility of quest when the checkbox is clicked
         */
        async function updateVisible() {
            return earlyCheck(behavior).setVisible(earlyCheck(formInputs.visibilityCheck.value).checked);
        }

        /**
         * Updates the quest type when different options are selected on the dropdown
         */
        async function updateType() {

            switch (earlyCheck(formInputs.typeSelect.value).selectedIndex) {
                case 0: // Selected "main"
                    return behavior?.setQuestType(QuestType.MAIN);
                case 1:
                    return behavior?.setQuestType(QuestType.SIDE);
                default:
                    console.error(new Error("Unsupported quest type selected"));
                    backToListNoSave();
                    return;
            }
        }

        /**
         * Updates the source region via the behavior when the update button is clicked
         */
        async function updateSourceRegion() {
            const input = earlyCheck(formInputs.regionInput.value);

            if (checkFilledAndMarkInvalidOtherwise(input)) {
                return earlyCheck(behavior).setSourceRegion(input.value);
            }
        }

        /**
         * Updates the quest description via the behavior when the button is clicked
         */
        async function updateDescription() {
            const input = earlyCheck(formInputs.descriptionInput.value);

            if (checkFilledAndMarkInvalidOtherwise(input)) {
                return earlyCheck(behavior).setDescription(input.value);
            }
        }

        /**
         * Adds an objective when the "add objective" button is clicked. Performs basic validation
         * to ensure the objective title is filled.
         */
        async function addObjective() {
            const input = earlyCheck(formInputs.objectiveTitleInput.value);

            if (checkFilledAndMarkInvalidOtherwise(input)) {
                const newObjectiveId = await earlyCheck(behavior).addObjective(input.value);
                objectivesList.value.push({id: newObjectiveId, completed: false, text: input.value});
                input.value = "";
            }
        }

        /**
         * Delete an objective when the "x" button is clicked via the behavior.
         * @param objective The objective to delete
         */
        async function deleteObjectiveFromInterface(objective: Objective) {
            await earlyCheck(behavior).removeObjective(objective.id);
            objectivesList.value.splice(objectivesList.value.indexOf(objective), 1);
        }

        /**
         * Updates the "complete" state of an objective when an objective checkbox is checked
         * @param objective
         */
        async function updateObjectiveComplete(objective: Objective) {
            // Bound value will not be updated when this is invoked, so use inverse of completed value
            return earlyCheck(behavior).updateObjectiveCompleted(objective.id, !objective.completed);
        }

        /**
         * Updates the text of an objective when the "update" button is pressed
         * @param objective
         */
        async function updateObjectiveText(objective: Objective) {
            if (objective.text.length !== 0) {
                return earlyCheck(behavior).updateObjectiveText(objective.id, objective.text);
            }
            else {
                alert("Please enter a title for your objective to update.");
            }
        }

        onMounted(() => {
            if (authToken.value === null) {
                throw new Error('Not logged in!');
            }

            try {
                behavior = createEditorBehavior(props.editMode, authToken.value, props.questToEdit);
            }
            catch (err) {
                console.error(err);
                emit("editor-exit");
                return;
            }

            const questUnderEdit = behavior.getUnderlyingQuest();

            (formInputs.nameInput.value as HTMLInputElement).value = questUnderEdit.name;
            (formInputs.visibilityCheck.value as HTMLInputElement).checked = questUnderEdit.visible;
            (formInputs.regionInput.value as HTMLInputElement).value = questUnderEdit.sourceRegion;
            (formInputs.descriptionInput.value as HTMLInputElement).value = questUnderEdit.description;
            objectivesList.value = JSON.parse(JSON.stringify(questUnderEdit.objectives));

            switch (questUnderEdit.questType) {
                case QuestType.MAIN:
                    (formInputs.typeSelect.value as HTMLSelectElement).selectedIndex = 0;
                    break;
                case QuestType.SIDE:
                    (formInputs.typeSelect.value as HTMLSelectElement).selectedIndex = 1;
                    break;
                default:
                    console.error(new Error(`Unsupported quest type: ${questUnderEdit.questType}`));
                    backToListNoSave();
                    return;
            }

        });

        return {
            editorTitle,
            editorMode,
            objectivesList,
            ...formInputs,

            updateName,
            updateVisible,
            updateType,
            updateSourceRegion,
            updateDescription,
            addObjective,
            deleteObjectiveFromInterface,
            updateObjectiveComplete,
            updateObjectiveText,

            backToListNoSave,
            backToListAndSave,
        }
    }
});
</script>

<style scoped lang="scss">
@import "../assets/CommonStyles";

#container {
    background-color: white;
}

.button {
    cursor: pointer;
}

.cancel {
    color: $themeAccentColor;
}

.border {
    border: 2px dashed dimgrey;
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 8px;
}

#descriptionBox {
    width: 100%;
    height: 150px;
}

h4 {
    margin: 0;
}
</style>
