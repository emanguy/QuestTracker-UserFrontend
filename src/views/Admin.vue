<template>
    <div class="side-spacer">
        <error-box class="margin-under" :backendError="currentError" :specialHttpStatusMessages="loginErrorMessages"></error-box>
        <component :is="contentType" @login-success="onLoginSuccess" @login-failure="onLoginFailure"></component>
    </div>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import QuestListInheritor from "../ts/QuestListInheritor";
    import AdminLoginDialog from "../components/AdminLoginDialog.vue";
    import AdminQuestList from "../components/AdminQuestEditor.vue";
    import ErrorBox from "../components/ErrorBox.vue";
    import {ApiCredentials} from "../ts/BackendConnector";

    @Component({
        components: {ErrorBox, AdminLoginDialog, AdminQuestList}
    })
    export default class AdminPage extends QuestListInheritor {
        contentType: string = "AdminLoginDialog";
        currentError: Error|null = null;
        credentials: ApiCredentials|null = null;
        loginErrorMessages = {
            400: "You sent a malformed username or password.",
            403: "Incorrect username or password.",
            404: "That user does not exist.",
            500: "Something on the back-end blew up."
        };

        onLoginSuccess(token: ApiCredentials) {
            console.log("Login successful");
            console.log(token);
            this.currentError = null;
            this.credentials = token;
            this.contentType = "AdminQuestList";
        }

        onLoginFailure(error: Error) {
            console.log("Login failure");
            console.log(error);
            this.currentError = error;
        }

        onLogout() {
            console.log("Logging user out.");
            this.contentType = "AdminLoginDialog";
            this.credentials = null;
        }
    }
</script>

<style scoped lang="scss">
    .margin-under {
        margin-bottom: 8px;
    }
</style>