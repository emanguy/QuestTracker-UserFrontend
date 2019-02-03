import {Objective, Quest, QuestType, RestBodyObjective, RestBodyQuest} from "common-interfaces";
import {v4 as uuidGen} from "uuid";
import {
    addObjectiveToQuest,
    ApiCredentials,
    createQuest,
    deleteObjective,
    modifyObjective,
    modifyQuest
} from "@/ts/BackendConnector";
import UpdateTargetNotFoundError from "@/ts/UpdateTargetNotFoundError";

export enum EditorMode {
    ADD = "add",
    UPDATE = "update"
}

export class BehaviorNotImplementedError extends Error {
    constructor(invalidValue: string) {
        super();
        this.message = `Value entered was invalid: ${invalidValue}`;
    }
}

export interface EditorBehavior {
    setVisible(visible: boolean) : Promise<void>
    setName(name: string) : Promise<void>
    setSourceRegion(region: string) : Promise<void>
    setQuestType(questType: QuestType) : Promise<void>
    addObjective(name: string) : Promise<string> // Creates an objective and returns the ID
    updateObjectiveText(id: string, newText: string) : Promise<void>
    updateObjectiveCompleted(id: string, complete: boolean) : Promise<void>
    removeObjective(id: string) : Promise<void>
    setDescription(newDescription : string) : Promise<void>
    getUnderlyingQuest() : RestBodyQuest
    complete() : Promise<void> // Called when editing is done
}

/**
 * Creates a new editor behavior instance for the quest editor page on entry.
 *
 * @param mode The editor mode (are we editing an existing quest or making a new one?)
 * @param credentials The credentials to hit the API with
 * @param questToEdit If going into edit mode, the existing quest properties
 *
 * @throws BehaviorNotImplementedError if the requested behavior hasn't been implemented
 */
export function createEditorBehavior(mode: EditorMode, credentials: ApiCredentials, questToEdit?: Quest) : EditorBehavior {
    switch (mode) {
        case EditorMode.ADD:
            return new EditorAddBehavior(credentials);
        case EditorMode.UPDATE:
            if (questToEdit === undefined) throw new Error("Forgot to provide the quest to edit in update mode.");
            return new EditorUpdateBehavior(credentials, questToEdit);
        default:
            throw new BehaviorNotImplementedError(mode);
    }
}

class EditorAddBehavior implements EditorBehavior {
    private readonly _quest: RestBodyQuest;
    private readonly _creds: ApiCredentials;

    constructor(credentials: ApiCredentials) {
        this._quest = {
            visible: true,
            name: "Add name",
            sourceRegion: "Add region",
            questType: QuestType.MAIN,
            objectives: [],
            description: "Add description"
        };
        this._creds = credentials;
    }

    async addObjective(name: string): Promise<string> {
        const newId = uuidGen();
        const objective: Objective = {
            id: newId,
            completed: false,
            text: name
        };

        this._quest.objectives.push(objective);
        return newId;
    }

    async complete(): Promise<void> {
        return createQuest(this._creds, this._quest);
    }

    async removeObjective(id: string): Promise<void> {
        for (let index in this._quest.objectives) {
            if (this._quest.objectives[index].id === id) {
                this._quest.objectives.splice(+index, 1);
                return;
            }
        }

        throw new UpdateTargetNotFoundError("Target not found during objective removal.", id);
    }

    async setDescription(newDescription: string): Promise<void> {
        this._quest.description = newDescription;
    }

    async setName(name: string): Promise<void> {
        this._quest.name = name;
    }

    async setQuestType(questType: QuestType): Promise<void> {
        this._quest.questType = questType;
    }

    async setSourceRegion(region: string): Promise<void> {
        this._quest.sourceRegion = region;
    }

    async setVisible(visible: boolean): Promise<void> {
        this._quest.visible = visible;
    }

    async updateObjectiveText(id: string, newText: string): Promise<void> {
        for (let objective of this._quest.objectives) {
            if (objective.id === id) {
                objective.text = newText;
                return;
            }
        }

        throw new UpdateTargetNotFoundError("Objective not found for update.", id);
    }

    async updateObjectiveCompleted(id: string, complete: boolean): Promise<void> {
        for (let objective of this._quest.objectives) {
            if (objective.id === id) {
                objective.completed = complete;
                return;
            }
        }

        throw new UpdateTargetNotFoundError("Objective not found for update.", id);
    }

    getUnderlyingQuest(): RestBodyQuest {
        return JSON.parse(JSON.stringify(this._quest));
    }
}

class EditorUpdateBehavior implements EditorBehavior {
    private readonly _quest : Quest;
    private readonly _creds : ApiCredentials;

    constructor(creds: ApiCredentials, existingQuest: Quest) {
        this._quest = JSON.parse(JSON.stringify(existingQuest));
        this._creds = creds;
    }

    async addObjective(name: string): Promise<string> {
        const newObjective: RestBodyObjective = {
            text: name,
            completed: false
        };

        let generatedId = await addObjectiveToQuest(this._creds, this._quest.id, newObjective);
        const fullObjective: Objective = Object.assign(newObjective, generatedId);

        this._quest.objectives.push(fullObjective);
        return generatedId.id;
    }

    async complete(): Promise<void> {
        // This method does nothing
        return;
    }

    getUnderlyingQuest(): RestBodyQuest {
        return this._quest;
    }

    async removeObjective(id: string): Promise<void> {
        let foundObjectiveIndex = -1;

        for (let objectiveIdx = 0; objectiveIdx <= this._quest.objectives.length; objectiveIdx++) {
            if (this._quest.objectives[objectiveIdx].id === id) {
                foundObjectiveIndex = objectiveIdx;
                break;
            }
        }

        if (foundObjectiveIndex >= 0) {
            this._quest.objectives.splice(foundObjectiveIndex,1);
        }
        else {
            throw new UpdateTargetNotFoundError("Could not find quest to delete.", id);
        }

        return deleteObjective(this._creds, this._quest.id, id);
    }

    async setDescription(description: string): Promise<void> {
        await modifyQuest(this._creds, this._quest.id, {description: description});
        this._quest.description = description;
    }

    async setName(name: string): Promise<void> {
        await modifyQuest(this._creds, this._quest.id, {name: name});
        this._quest.name = name;
    }

    async setQuestType(questType: QuestType): Promise<void> {
        await modifyQuest(this._creds, this._quest.id, {questType: questType});
        this._quest.questType = questType;
    }

    async setSourceRegion(sourceRegion: string): Promise<void> {
        await modifyQuest(this._creds, this._quest.id, {sourceRegion: sourceRegion});
        this._quest.sourceRegion = sourceRegion;
    }

    async setVisible(visible: boolean): Promise<void> {
        await modifyQuest(this._creds, this._quest.id, {visible: visible});
        this._quest.visible = visible;
    }

    async updateObjectiveCompleted(id: string, completed: boolean): Promise<void> {
        return this.updateObjective(id, async obj => {
            await modifyObjective(this._creds, this._quest.id, id, {completed: completed});
            obj.completed = completed;
        });
    }

    async updateObjectiveText(id: string, text: string): Promise<void> {
        return this.updateObjective(id, async obj => {
            await modifyObjective(this._creds, this._quest.id, id, {text: text});
            obj.text = text;
        });
    }

    private async updateObjective(id: string, action: (obj: Objective) => Promise<void>) : Promise<void> {
        let objectiveFound = false;

        for (let objective of this._quest.objectives) {
            if (objective.id === id) {
                objectiveFound = true;
                await action(objective);
                break;
            }
        }

        if (!objectiveFound) {
            throw new UpdateTargetNotFoundError("Could not find objective during property update.", id);
        }
    }
}
