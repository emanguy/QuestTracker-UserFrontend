import { inject, Ref, InjectionKey } from 'vue';
import {Quest} from "common-interfaces/QuestInterfaces";
import {assertExists} from "../ts/Assertions";

export const QUEST_LIST_KEY: InjectionKey<Ref<Array<Quest>>> = Symbol();
export const BACKEND_ERROR_KEY: InjectionKey<Ref<Error|null>> = Symbol();

export function useQuestListInheritor(): { questList: Ref<Array<Quest>>, backendError: Ref<Error|null> } {
    const questList = assertExists(inject(QUEST_LIST_KEY));
    const backendError = assertExists(inject(BACKEND_ERROR_KEY));

    return { questList, backendError };
}
