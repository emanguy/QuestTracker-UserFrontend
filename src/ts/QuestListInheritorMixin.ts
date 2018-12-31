import {Component, Prop, Vue} from "vue-property-decorator";
import {Quest} from "common-interfaces/QuestInterfaces";

@Component
export default class QuestListInheritorMixin extends Vue {
    @Prop() questList!: Quest[];
    @Prop() backendError!: Error|null;
}

