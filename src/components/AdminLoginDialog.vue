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
    import {Component, Vue} from "vue-property-decorator";
    import {ApiCredentials, loginWithCredentials} from "../ts/BackendConnector";

    @Component
    export default class AdminLoginDialog extends Vue {
        enteredUsername: string = "";
        enteredPassword: string = "";
        error: Error|null = null;
        loginFunction: (username: string, password: string) => Promise<ApiCredentials> = loginWithCredentials;

        async attemptLogin() {
            try {
                const loginCreds = await this.loginFunction(this.enteredUsername, this.enteredPassword);
                this.$emit("login-success", loginCreds);
            }
            catch (err) {
                this.$emit("login-failure", err);
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles.scss";

    #mainContainer {
        background-color: white;
    }
</style>