import { inject, Ref, InjectionKey } from 'vue';
import {Quest} from "common-interfaces/QuestInterfaces";

export const QUEST_LIST_KEY: InjectionKey<Ref<Array<Quest>>> = Symbol();
export const BACKEND_ERROR_KEY: InjectionKey<Ref<Error|null>> = Symbol();

export function useQuestListInheritor(): {questList: Ref<Array<Quest>>, backendError: Ref<Error|null> } {
    const questList = inject(QUEST_LIST_KEY);
    const backendError = inject(BACKEND_ERROR_KEY);

    if (questList === undefined || backendError === undefined) {
        throw new Error('Quest list or backend error injection failure!');
    }

    return { questList, backendError };
}
