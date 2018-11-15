<template>
    <div id="errorBox" class="rounded-container" v-if="hideOnNoError && backendError != null">
        <p><i class="material-icons">warning</i> {{renderError}}</p>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {BackendOfflineError, BadHTTPCodeError, MalformedResponseError} from "../ts/BackendConnector";

    @Component
    export default class ErrorBox extends Vue{
        @Prop({default: null}) backendError!: Error|null;
        @Prop({default: true}) hideOnNoError!: Boolean;

        get renderError() : String {
            if (this.backendError instanceof BadHTTPCodeError) {
                return `Backend server sent bad HTTP code: ${this.backendError.statusCode}. Please reload the page.`;
            }
            else if (this.backendError instanceof MalformedResponseError) {
                return "Couldn't make heads or tails of the response from the server. Please reload the page.";
            }
            else if (this.backendError instanceof BackendOfflineError) {
                return "Could not get the list of quests, the backend server could not be reached.";
            }
            else {
                return "Unknown error occurred.";
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles.scss";

    #errorBox {
        background-color: $themeAccentColor;
        color: $onAccentColor;
    }
</style>