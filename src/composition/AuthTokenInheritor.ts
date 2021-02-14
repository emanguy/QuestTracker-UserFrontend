import {inject, InjectionKey, Ref} from "vue";
import {ApiCredentials} from "../ts/BackendConnector";
import {assertExists} from "../ts/Assertions";

export const AUTH_TOKEN_KEY: InjectionKey<Ref<ApiCredentials | null>> = Symbol();

export function useAuthTokenInheritor(): { authToken: Ref<ApiCredentials | null> } {
    const authToken = assertExists(inject(AUTH_TOKEN_KEY));

    return { authToken };
}
