import {Component, Prop, Vue} from "vue-property-decorator";
import {ApiCredentials} from "@/ts/BackendConnector";

@Component
export default class AuthTokenInheritorMixin extends Vue {
    @Prop({default: null}) authToken!: ApiCredentials;
}