<template>
    <div>
        <div id="mainContainer" class="rounded-container">
            <form @submit.prevent="attemptLogin">
                <h3>DM Log-in</h3>
                <label>
                    Username:
                    <input type="text" v-model="enteredUsername">
                </label>
                <br>
                <label>
                    Password:
                    <input type="password" v-model="enteredPassword">
                </label>
                <br>
                <input type="submit">
            </form>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent, Ref, ref} from "vue";
    import {ApiCredentials, loginWithCredentials} from "../ts/BackendConnector";

    export default defineComponent({
        setup(_, { emit }) {
            const enteredUsername = ref("");
            const enteredPassword = ref("");
            const error: Ref<Error|null> = ref(null);
            const loginFunction: (username: string, password: string) => Promise<ApiCredentials> = loginWithCredentials;

            async function attemptLogin() {
                try {
                    const loginCreds = await loginFunction(this.enteredUsername, this.enteredPassword);
                    emit("login-success", loginCreds);
                }
                catch (err) {
                    emit("login-failure", err);
                }
            }

            return { enteredUsername, enteredPassword, error, attemptLogin };
        }
    });
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles.scss";

    #mainContainer {
        background-color: white;
    }
</style>
