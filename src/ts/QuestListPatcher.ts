import {
    GenericAdd,
    GenericDeletion,
    GenericUpdate,
    HierarchyLevel,
    Objective,
    ObjectiveUpdate,
    Quest,
    QuestUpdate
} from "common-interfaces/QuestInterfaces";
import UpdateTargetNotFoundError from "@/ts/UpdateTargetNotFoundError";

interface QuestAndIndex {
    index: number
    quest: Quest
}

interface ObjectiveAndIndex {
    index: number
    objective: Objective
}

function findQuestToModify(questId: string, questList: Quest[]) : QuestAndIndex|null {
    let questToModify: QuestAndIndex|null = null;

    for (let questIndex in questList) {
        if (questList[questIndex].id == questId) {
            questToModify = {index: +questIndex, quest: questList[questIndex]};
            break;
        }
    }

    return questToModify;
}

function findObjectiveToModify(objectiveId: string, objectiveList: Objective[]) : ObjectiveAndIndex|null {
    let objectiveToModify: ObjectiveAndIndex|null = null;

    for (let objectiveIndex in objectiveList) {
        if (objectiveList[objectiveIndex].id == objectiveId) {
            objectiveToModify = {index: +objectiveIndex, objective: objectiveList[objectiveIndex]};
            break;
        }
    }

    return objectiveToModify;
}

export function patchQuestListOnAdd(addition: GenericAdd, questList: Quest[]) {
    if (addition.type == HierarchyLevel.QUEST) {
        questList.push(<Quest> addition.newData);
    }
    else if (addition.type == HierarchyLevel.OBJECTIVE) {
        let questToModify = findQuestToModify(<string> addition.questId, questList);

        if (questToModify == null) {
            throw new UpdateTargetNotFoundError("Target not found on add.", addition.questId);
        }

        questToModify.quest.objectives.push(<Objective> addition.newData);
    }
}

export function patchQuestListOnUpdate(update: GenericUpdate, questList: Quest[]) {
    if (update.type == HierarchyLevel.QUEST) {
        let questUpdateDetail = <QuestUpdate> update.updateDetail;
        let questToUpdate = findQuestToModify(questUpdateDetail.id, questList);

        if (questToUpdate == null) {
            throw new UpdateTargetNotFoundError("Quest not found on update.", questUpdateDetail.id);
        }

        if (questUpdateDetail.name != undefined) questToUpdate.quest.name = questUpdateDetail.name;
        if (questUpdateDetail.description != undefined) questToUpdate.quest.description = questUpdateDetail.description;
        if (questUpdateDetail.questType != undefined) questToUpdate.quest.questType = questUpdateDetail.questType;
        if (questUpdateDetail.sourceRegion != undefined) questToUpdate.quest.sourceRegion = questUpdateDetail.sourceRegion;
        if (questUpdateDetail.visible != undefined) questToUpdate.quest.visible = questUpdateDetail.visible;
    }
    if (update.type == HierarchyLevel.OBJECTIVE) {
        let objectiveUpdateDetail = <ObjectiveUpdate> update.updateDetail;
        let questToUpdate = findQuestToModify(objectiveUpdateDetail.questId, questList);

        if (questToUpdate == null) {
            throw new UpdateTargetNotFoundError("Quest not found on update", objectiveUpdateDetail.questId);
        }

        let objectiveToUpdate = findObjectiveToModify(objectiveUpdateDetail.objectiveId, questToUpdate.quest.objectives);

        if (objectiveToUpdate == null) {
            throw new UpdateTargetNotFoundError("Objective not found on update", objectiveUpdateDetail.objectiveId);
        }

        if (objectiveUpdateDetail.text != undefined) objectiveToUpdate.objective.text = objectiveUpdateDetail.text;
        if (objectiveUpdateDetail.completed != undefined) objectiveToUpdate.objective.completed = objectiveUpdateDetail.completed;
    }
}

export function patchQuestListOnDelete(deletion: GenericDeletion, questList: Quest[]) {
    if (deletion.type == HierarchyLevel.QUEST) {
        let questToDelete = findQuestToModify(deletion.id, questList);

        if (questToDelete == null) {
            throw new UpdateTargetNotFoundError("Quest not found for deletion.", deletion.id);
        }

        questList.splice(questToDelete.index, 1);
    }
    else if (deletion.type == HierarchyLevel.OBJECTIVE) {
        let questToDeleteFrom = findQuestToModify(deletion.id, questList);

        if (questToDeleteFrom == null) {
            throw new UpdateTargetNotFoundError("Quest not found for objective deletion.", deletion.id);
        }
        if (deletion.subId === undefined) {
            throw new UpdateTargetNotFoundError("Deletion did not give objective ID.", deletion.id);
        }

        let objectiveToDelete = findObjectiveToModify(deletion.subId, questToDeleteFrom.quest.objectives);

        if (objectiveToDelete == null) {
            throw new UpdateTargetNotFoundError("Objective not found for deletion.", deletion.subId);
        }

        questToDeleteFrom.quest.objectives.splice(objectiveToDelete.index, 1);
    }
}
