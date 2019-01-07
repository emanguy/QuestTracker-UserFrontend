import {QuestType} from "common-interfaces";

export enum EditorMode {
    ADD,
    UPDATE
}

export interface EditorBehavior {
    setName(name: string) : void
    setVisible(visible: boolean) : void
    setType(questType: QuestType) : void
    setRegion(region: string) : void
    // TODO add the rest of the necessary properties
}
