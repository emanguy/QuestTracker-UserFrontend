<template>
    <div id="errorBox" class="rounded-container" v-if="hideOnNoError && backendError != null">
        <p><i class="material-icons">warning</i> {{renderError}}</p>
    </div>
</template>

<script lang="ts">
    import {computed, defineComponent} from "vue";
    import {BackendOfflineError, BadHTTPCodeError, MalformedResponseError} from "../ts/BackendConnector";

    export default defineComponent({
        props: {
            backendError: {
                type: Error,
                default: null,
            },
            hideOnNoError: {
                type: Boolean,
                default: true,
            },
            specialHttpStatusMessages: {
                type: Object,
                default: () => {},
            },
        },

        setup(props) {
            const renderError = computed(() => {
                if (props.backendError instanceof BadHTTPCodeError) {
                    if (props.specialHttpStatusMessages[props.backendError.statusCode]) {
                        return props.specialHttpStatusMessages[props.backendError.statusCode];
                    }
                    else {
                        return `Backend server sent bad HTTP code: ${props.backendError.statusCode}. Please reload the page.`;
                    }
                }
                else if (props.backendError instanceof MalformedResponseError) {
                    return "Couldn't make heads or tails of the response from the server. Please reload the page.";
                }
                else if (props.backendError instanceof BackendOfflineError) {
                    return "Could not get the list of quests, the backend server could not be reached.";
                }
                else {
                    return "Unknown error occurred.";
                }
            });

            return { renderError };
        }
    });
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles.scss";

    #errorBox {
        background-color: $themeAccentColor;
        color: $onAccentColor;
    }
</style>
