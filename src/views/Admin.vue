<template>
    <div class="side-spacer">
        <error-box class="margin-under" :backendError="currentError" :specialHttpStatusMessages="loginErrorMessages"></error-box>
        <component
                :is="contentType"
                @login-success="onLoginSuccess"
                @login-failure="onAccessFailure"
                @backend-error="onAccessFailure"
                @logout-request="onLogout"
        ></component>
    </div>
</template>

<script lang="ts">
    import AdminLoginDialog from "../components/AdminLoginDialog.vue";
    import AdminQuestList from "../components/AdminQuestEditor.vue";
    import ErrorBox from "../components/ErrorBox.vue";
    import {ApiCredentials, deauthCredentials} from "../ts/BackendConnector";
    import {defineComponent, provide, reactive, ref} from "vue";
    import {AUTH_TOKEN_KEY} from "../composition/AuthTokenInheritor";

    export default defineComponent({
        components: { ErrorBox, AdminLoginDialog, AdminQuestList },
        setup() {
            const contentType = ref("AdminLoginDialog");
            const credentials = ref<ApiCredentials|null>(null);
            provide(AUTH_TOKEN_KEY, credentials);

            const currentError = ref<Error|null>(null);
            const loginErrorMessages = reactive({
                400: "You sent a malformed username or password.",
                403: "Incorrect username/password combination or expired session.",
                404: "That user does not exist.",
                500: "Something on the back-end blew up."
            });

            function onLoginSuccess(token: ApiCredentials) {
                console.log("Login successful");
                console.log(token);
                currentError.value = null;
                credentials.value = token;
                contentType.value = "AdminQuestList";
            }
            function onAccessFailure(error: Error) {
                console.log("Backend access failure");
                console.log(error);
                currentError.value = error;
                credentials.value = null;
                contentType.value = "AdminLoginDialog";
            }

            async function onLogout() {
                console.log("Logging user out.");

                if (credentials.value != null) {
                    try {
                        await deauthCredentials(credentials.value);
                    }
                    catch (err) {
                        console.error("Deauth failed.");
                        console.error(err);
                    }
                }

                contentType.value = "AdminLoginDialog";
                credentials.value = null;
                alert("Successfully logged out.");
            }

            return {
                contentType,
                credentials,
                currentError,
                loginErrorMessages,

                onLoginSuccess,
                onAccessFailure,
                onLogout,
            };
        }
    });
</script>

<style scoped lang="scss">
    .margin-under {
        margin-bottom: 8px;
    }
</style>
