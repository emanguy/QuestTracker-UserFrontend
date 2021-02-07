import {
    GenericAdd,
    GenericDeletion,
    GenericUpdate,
    HierarchyLevel,
    Objective,
    ObjectiveUpdate,
    Quest,
    QuestType,
    QuestUpdate
} from "common-interfaces";
import {patchQuestListOnAdd, patchQuestListOnDelete, patchQuestListOnUpdate} from "../../../src/ts/QuestListPatcher";
import UpdateTargetNotFoundError from "../../../src//ts/UpdateTargetNotFoundError";

describe("Quest list patchers", () => {
    let questList: Quest[];
    const questToAdd: Quest = {
        id: "quest1",
        visible: true,
        name: "Quest one",
        sourceRegion: "termina",
        objectives: [],
        questType: QuestType.MAIN,
        description: "Most important quest ever"
    };
    const questToAdd2: Quest = {
        id: "quest2",
        visible: true,
        name: "Quest two",
        sourceRegion: "termina",
        objectives: [],
        questType: QuestType.MAIN,
        description: "Second most important quest ever"
    };
    const objectiveOne: Objective = {
        id: "objective1",
        text: "Objective one",
        completed: false
    };
    const objectiveTwo: Objective = {
        id: "objective2",
        text: "Objective two",
        completed: false
    };

    beforeEach(() => {
        questList = [];
    });

    it("can add new quests to the quest list", () => {
        const addRequest: GenericAdd = {
            type: HierarchyLevel.QUEST,
            newData: questToAdd
        };

        patchQuestListOnAdd(addRequest, questList);

        expect(questList).toMatchObject([ questToAdd ]);
    });

    it("can add new objectives to existing quests", () => {
        questList.push(questToAdd, questToAdd2);
        questToAdd.objectives.push(objectiveOne);

        const addRequest: GenericAdd = {
            type: HierarchyLevel.OBJECTIVE,
            questId: questToAdd2.id,
            newData: objectiveTwo
        };

        patchQuestListOnAdd(addRequest, questList);

        expect(questList[1].objectives).toMatchObject([objectiveTwo]);
    });

    it("throws an exception when a quest cannot be found on objective add", () => {
        const addRequest: GenericAdd = {
            type: HierarchyLevel.OBJECTIVE,
            questId: questToAdd2.id,
            newData: objectiveTwo
        };

        expect(() => patchQuestListOnAdd(addRequest, questList)).toThrowError(UpdateTargetNotFoundError);
    });

    it("can update quests", () => {
        const newName = "New quest name";
        const newRegion = "hortimony";
        const questUpdate: QuestUpdate = {
            id: questToAdd.id,
            name: newName,
            sourceRegion: newRegion
        };
        const updateRequest: GenericUpdate = {
            type: HierarchyLevel.QUEST,
            updateDetail: questUpdate
        };
        const expectedQuest: Quest = JSON.parse(JSON.stringify(questToAdd));

        expectedQuest.name = newName;
        expectedQuest.sourceRegion = newRegion;

        questList.push(questToAdd, questToAdd2);

        patchQuestListOnUpdate(updateRequest, questList);

        expect(questToAdd).toEqual(expectedQuest);
    });

    it("throws an exception when a quest could not be found on update", () => {
        const questUpdate: QuestUpdate = {
            id: "quest-not-existing",
            name: "new name"
        };
        const updateRequest: GenericUpdate = {
            type: HierarchyLevel.QUEST,
            updateDetail: questUpdate
        };

        expect(() => patchQuestListOnUpdate(updateRequest, questList)).toThrowError(UpdateTargetNotFoundError);
    });

    it("can update objectives", () => {
        const newText = "New text";
        const completeStatus = true;
        const objectiveUpdate: ObjectiveUpdate = {
            questId: questToAdd.id,
            objectiveId: objectiveOne.id,
            text: newText,
            completed: completeStatus
        };
        const updateRequest: GenericUpdate = {
            type: HierarchyLevel.OBJECTIVE,
            updateDetail: objectiveUpdate
        };

        const expectedObjective: Objective = JSON.parse(JSON.stringify(objectiveOne));
        expectedObjective.text = newText;
        expectedObjective.completed = completeStatus;

        questToAdd.objectives.push(objectiveOne);
        questList.push(questToAdd);

        patchQuestListOnUpdate(updateRequest, questList);

        expect(objectiveOne).toEqual(expectedObjective);
    });

    it("throws an exception when an objective could not be found on update", () => {
        const objectiveUpdate: ObjectiveUpdate = {
            questId: questToAdd.id,
            objectiveId: "non-existent",
            text: "hello world"
        };
        const updateRequest: GenericUpdate = {
            type: HierarchyLevel.OBJECTIVE,
            updateDetail: objectiveUpdate
        };

        questList.push(questToAdd);

        expect(() => patchQuestListOnUpdate(updateRequest, questList)).toThrowError(UpdateTargetNotFoundError);
    });

    it("can delete quests", () => {
        const deletionRequest: GenericDeletion = {
            type: HierarchyLevel.QUEST,
            id: questToAdd.id
        };

        questList.push(questToAdd, questToAdd2);
        patchQuestListOnDelete(deletionRequest, questList);

        expect(questList).toMatchObject([questToAdd2]);
    });

    it("throws an exception when a quest could not be found for deletion", () => {
        const deletionRequest: GenericDeletion = {
            type: HierarchyLevel.QUEST,
            id: "does-not-exist"
        };

        expect(() => patchQuestListOnDelete(deletionRequest, questList)).toThrowError(UpdateTargetNotFoundError);
    });

    it("can delete objectives", () => {
        const deletionRequest: GenericDeletion = {
            type: HierarchyLevel.OBJECTIVE,
            id: questToAdd2.id,
            subId: objectiveOne.id
        };

        questList.push(questToAdd, questToAdd2);
        questToAdd.objectives.push(objectiveOne);

        const expectedQuestList: Quest[] = JSON.parse(JSON.stringify(questList));

        questToAdd2.objectives.push(objectiveOne);
        patchQuestListOnDelete(deletionRequest, questList);

        expect(questList).toMatchObject(expectedQuestList);
    });

    it("throws an exception when an objective could not be found for deletion", () => {
        const deletionRequest: GenericDeletion = {
            type: HierarchyLevel.OBJECTIVE,
            id: questToAdd.id,
            subId: "does-not-exist"
        };

        questList.push(questToAdd);
        expect(() => patchQuestListOnDelete(deletionRequest, questList)).toThrowError(UpdateTargetNotFoundError);
    });
});
