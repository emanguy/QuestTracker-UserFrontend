import sinon from "sinon";
import chai, {expect} from 'chai';
import promiseExtension from "chai-as-promised";
import {BadHTTPCodeError, MalformedResponseError} from '../../src/ts/BackendConnector';
import MainAppComponent from "../../src/App.vue";
import {shallowMount} from "@vue/test-utils";
import {timeout} from "./TestUtils";
import Router from "vue-router";
import Vue from "vue";

chai.use(promiseExtension);
Vue.use(Router);

describe("Primary app component", () => {
    it("retries backend request 5 times before giving up", async () => {
        const getQuestListStub = sinon.stub().rejects(new BadHTTPCodeError("message", 400));
        const mount = shallowMount(MainAppComponent, {
            data: function() { // Overwriting the method to retrieve quests
                return {
                    retrieveQuestsMethod: getQuestListStub
                }
            }
        });

        await timeout(100);
        console.log(`Times stub was invoked: ${getQuestListStub.callCount}`);
        expect(getQuestListStub.callCount).to.equal(5);
        expect(mount.vm.$data["backendError"]).to.be.an.instanceOf(BadHTTPCodeError);
    });

    it("resets error count to 0 on a success", async () => {
        const failingGetQuestsStub = sinon.stub();
        failingGetQuestsStub.onCall(0).rejects(new BadHTTPCodeError("message", 400));
        failingGetQuestsStub.onCall(1).rejects(new MalformedResponseError());
        failingGetQuestsStub.resolves([]);
        const mount = shallowMount(MainAppComponent, {
            data: function () { // Overwriting the method to retrieve quests
                return {
                    retrieveQuestsMethod: failingGetQuestsStub
                }
            }
        });

        await timeout(100);
        expect(mount.vm.$data["badResponseRetries"]).to.equal(0);
    });
});