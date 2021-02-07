import {inject, InjectionKey, Ref} from "vue";
import {ApiCredentials} from "../ts/BackendConnector";

export const AUTH_TOKEN_KEY: InjectionKey<Ref<ApiCredentials | null>> = Symbol();

export function useAuthTokenInheritor(): {authToken: Ref<ApiCredentials | null>} {
    const authToken = inject(AUTH_TOKEN_KEY);
    if (authToken === undefined) {
        throw new Error('Auth token failed to inject!');
    }

    return { authToken };
}
