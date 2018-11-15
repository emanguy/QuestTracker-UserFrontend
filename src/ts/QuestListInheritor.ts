import { Prop, Vue } from "vue-property-decorator";
import { Quest } from "common-interfaces/QuestInterfaces";

export default class QuestListInheritor extends Vue {
    @Prop() questList!: Quest[];
    @Prop() backendError!: Error|null;
}

