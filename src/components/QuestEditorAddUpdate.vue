import {QuestType} from "common-interfaces/QuestInterfaces";
import {QuestType} from "common-interfaces/QuestInterfaces";
import {QuestType} from "common-interfaces/QuestInterfaces";
import {QuestType} from "common-interfaces/QuestInterfaces";
import {EditorMode} from "../ts/EditorBehavior";
import {EditorMode} from "../ts/EditorBehavior";
import {EditorMode} from "../ts/EditorBehavior";
import {EditorMode} from "../ts/EditorBehavior";
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
                <input type="button" v-if="inEditMode" value="Update" @click="updateName"/>
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
                <input type="button" v-if="inEditMode" value="Update" @click="updateSourceRegion">
            </div>
            <div>
                <label>
                    Description: <textarea maxlength="3000" ref="descriptionInput"></textarea>
                </label>
                <input type="button" v-if="inEditMode" value="Update" @click="updateDescription">
            </div>
            <div class="vertical-flexbox border">
                <h4>Objectives:</h4>
                <div v-for="objective of objectivesList" :key="objective.id">
                    <span class="material-icons cancel button" @click="deleteObjectiveFromInterface(objective)">cancel</span>
                    <input type="checkbox" v-model="objective.completed" title="Objective Completion" @click="updateObjectiveComplete(objective)">
                    <input type="text" v-model="objective.text" required>
                    <input type="button" v-if="inEditMode" value="Update Title" @click="updateObjectiveText(objective)">
                </div>
                <div>
                    <label>
                        Add Objective: <input ref="objectiveTitleInput" placeholder="Objective Title">
                    </label>
                    <input type="button" value="Add Objective" @click="addObjective">
                </div>
            </div>
            <input type="submit" v-if="!inEditMode">
        </form>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import {mixins} from "vue-class-component";
    import {Objective, Quest, QuestType} from "common-interfaces";
    import AuthTokenInheritorMixin from "@/ts/AuthTokenInheritorMixin";
    import {createEditorBehavior, EditorBehavior, EditorMode} from "@/ts/EditorBehavior";

    type FormInputs = {
        nameInput: HTMLInputElement
        visibilityCheck: HTMLInputElement
        typeSelect: HTMLSelectElement
        regionInput: HTMLInputElement
        descriptionInput: HTMLInputElement
        objectiveTitleInput: HTMLInputElement
    }

    // TODO improve error handling
    @Component
    export default class QuestEditorAddUpdate extends mixins(AuthTokenInheritorMixin) {
        @Prop() questToEdit!: Quest;
        @Prop() editMode!: EditorMode;
        private behavior!: EditorBehavior;
        objectivesList: Objective[] = [];

        mounted() {
            try {
                this.behavior = createEditorBehavior(this.editMode, this.authToken, this.questToEdit);
            }
            catch (err) {
                console.error(err);
                this.$emit("editor-exit");
                return;
            }

            const questUnderEdit = this.behavior.getUnderlyingQuest();
            const formInputs = this.formInputs;

            formInputs.nameInput.value = questUnderEdit.name;
            formInputs.visibilityCheck.checked = questUnderEdit.visible;
            formInputs.regionInput.value = questUnderEdit.sourceRegion;
            formInputs.descriptionInput.value = questUnderEdit.description;
            this.objectivesList = JSON.parse(JSON.stringify(questUnderEdit.objectives));

            switch (questUnderEdit.questType) {
                case QuestType.MAIN:
                    formInputs.typeSelect.selectedIndex = 0;
                    break;
                case QuestType.SIDE:
                    formInputs.typeSelect.selectedIndex = 1;
                    break;
                default:
                    console.error(new Error(`Unsupported quest type: ${questUnderEdit.questType}`));
                    this.backToListNoSave();
                    return;
            }
        }

        get editorTitle(): string {
            switch (this.editMode) {
                case EditorMode.ADD:
                    return "New Quest";
                case EditorMode.UPDATE:
                    return "Update Quest";
                default:
                    return "ERROR";
            }
        }

        get inEditMode(): boolean {
            return this.editMode === EditorMode.UPDATE;
        }

        backToListNoSave() {
            this.$emit("editor-exit");
        }

        async backToListAndSave() {
            const formInputs = this.formInputs;[]
            const behaviorInputPromises: Promise<any>[] = [];

            behaviorInputPromises.push(this.behavior.setName(formInputs.nameInput.value));
            behaviorInputPromises.push(this.behavior.setSourceRegion(formInputs.regionInput.value));
            behaviorInputPromises.push(this.behavior.setDescription(formInputs.descriptionInput.value));
            this.objectivesList.forEach((objective) => {
                if (objective.text.length > 0) {
                    behaviorInputPromises.push(this.behavior.updateObjectiveText(objective.id, objective.text))
                }
                else {
                    return; // The required attribute should show an error, so just return and don't allow the complete
                }
            });

            await Promise.all(behaviorInputPromises);
            await this.behavior.complete();
            this.$emit("editor-exit");
        }

        async updateName() {
            const input = this.formInputs.nameInput;

            if (QuestEditorAddUpdate.checkFilledAndMarkInvalidOtherwise(input)) {
                return this.behavior.setName(input.value);
            }
        }

        async updateVisible() {
            return this.behavior.setVisible(this.formInputs.visibilityCheck.checked);
        }

        async updateType() {
            switch (this.formInputs.typeSelect.selectedIndex) {
                case 0: // Selected "main"
                    return this.behavior.setQuestType(QuestType.MAIN);
                case 1:
                    return this.behavior.setQuestType(QuestType.SIDE);
                default:
                    console.log(new Error("Unsupported quest type selected"));
                    this.backToListNoSave();
                    return;
            }
        }

        async updateSourceRegion() {
            const input = this.formInputs.regionInput;

            if (QuestEditorAddUpdate.checkFilledAndMarkInvalidOtherwise(input)) {
                return this.behavior.setSourceRegion(input.value);
            }
        }

        async updateDescription() {
            const input = this.formInputs.descriptionInput;

            if (QuestEditorAddUpdate.checkFilledAndMarkInvalidOtherwise(input)) {
                return this.behavior.setDescription(input.value);
            }
        }

        async addObjective() {
            const input = this.formInputs.objectiveTitleInput;

            if (QuestEditorAddUpdate.checkFilledAndMarkInvalidOtherwise(input)) {
                const newObjectiveId = await this.behavior.addObjective(input.value);
                this.objectivesList.push({id: newObjectiveId, completed: false, text: input.value});
                input.value = "";
            }
        }

        async deleteObjectiveFromInterface(objective: Objective) {
            await this.behavior.removeObjective(objective.id);
            this.objectivesList.splice(this.objectivesList.indexOf(objective), 1);
        }

        async updateObjectiveComplete(objective: Objective) {
            // Bound value will not be updated when this is invoked, so use inverse of completed value
            return this.behavior.updateObjectiveCompleted(objective.id, !objective.completed);
        }

        async updateObjectiveText(objective: Objective) {
            if (objective.text.length !== 0) {
                return this.behavior.updateObjectiveText(objective.id, objective.text);
            }
            else {
                alert("Please enter a title for your objective to update.");
            }
        }

        private get formInputs(): FormInputs {
            return {
                nameInput: <HTMLInputElement> this.$refs["nameInput"],
                visibilityCheck: <HTMLInputElement> this.$refs["visibilityCheck"],
                typeSelect: <HTMLSelectElement> this.$refs["typeSelect"],
                regionInput: <HTMLInputElement> this.$refs["regionInput"],
                descriptionInput: <HTMLInputElement> this.$refs["descriptionInput"],
                objectiveTitleInput: <HTMLInputElement> this.$refs["objectiveTitleInput"]
            };
        }

        private static checkFilledAndMarkInvalidOtherwise(element: HTMLInputElement): boolean {
            const inputFilled = element.value.length > 0;

            if (inputFilled) element.setCustomValidity("");
            else element.setCustomValidity("Fill this please");

            return inputFilled;
        }
    }
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

    h4 {
        margin: 0;
    }
</style>