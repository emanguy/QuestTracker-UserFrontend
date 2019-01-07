<template>
    <div>
        <div class="center">
            <h1 id="editTitle" class="primary-color-background rounded-container ">Edit Quests</h1>
            <br>
            <h2 id="logoutBtn" class="rounded-container" @click="logout">Log out</h2>
        </div>
        <hr>
        <!-- TODO add prop bindings for selected quest and edit mode -->
        <component
                :is="currentEditorView"
                :quest-list="questList"
                :auth-token="authToken"
        ></component>
    </div>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import QuestEditorList from "./QuestEditorList.vue";
    import QuestListInheritorMixin from "../ts/QuestListInheritorMixin";
    import {mixins} from "vue-class-component";
    import AuthTokenInheritorMixin from "@/ts/AuthTokenInheritorMixin";


    @Component({
        components: {QuestEditorList}
    })
    export default class AdminQuestEditor extends mixins(QuestListInheritorMixin, AuthTokenInheritorMixin) {
        currentEditorView: string = "QuestEditorList";

        logout() {
            this.currentEditorView = "QuestEditorList";
            this.$emit("logout-request");
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/CommonStyles";
    @import "../assets/MouseHoverMixin";

    #editTitle {
        display: inline-block;
    }

    #logoutBtn {
        @include hover-animation();

        display: inline-block;
        background-color: white;
    }

</style>