import {BadHTTPCodeError, MalformedResponseError} from '../../src/ts/BackendConnector';
import MainAppComponent from "../../src/App.vue";
import {shallowMount} from "@vue/test-utils";
import {timeout} from "./TestUtils";
import router from "../../src/router";

jest.mock("../../src/ts/PathGeneration.ts");

describe("Primary app component", () => {
    const fakeBackendListener = {
        createEventListeners: [],
        updateEventListeners: [],
        deleteEventListeners: [],
        errorEventListeners: [],
        startListening: jest.fn(),
        stopListening: jest.fn(),
    };

    beforeEach(() => {
        fakeBackendListener.createEventListeners = [];
        fakeBackendListener.updateEventListeners = [];
        fakeBackendListener.deleteEventListeners = [];
        fakeBackendListener.errorEventListeners = [];
        fakeBackendListener.startListening.mockClear();
        fakeBackendListener.stopListening.mockClear();
    });

    it("retries backend request 5 times before giving up", async () => {
        const getQuestListStub = jest.fn(async () => {
            throw new BadHTTPCodeError("message", 400)
        });
        const mount = shallowMount(MainAppComponent, {
            props: {
                retrieveQuestsMethod: getQuestListStub,
                backendUpdateListener: fakeBackendListener
            },
            global: {
                plugins: [router],
            },
        });

        await timeout(100);
        console.log(`Times stub was invoked: ${getQuestListStub.mock.calls.length}`);
        expect(getQuestListStub).toHaveBeenCalledTimes(5);
        expect(mount.vm.backendError).toBeInstanceOf(BadHTTPCodeError);
    });

    it("resets error count to 0 on a success", async () => {
        const failingGetQuestsStub = jest.fn(async () => [])
            .mockImplementationOnce(async () => {
                throw new BadHTTPCodeError("message", 400);
            })
            .mockImplementationOnce(async () => {
                throw new MalformedResponseError();
            });
        const mount = shallowMount(MainAppComponent, {
            props: {
                retrieveQuestsMethod: failingGetQuestsStub,
                backendUpdateListener: fakeBackendListener
            },
            global: {
                plugins: [router],
            },
        });

        await timeout(100);
        expect(mount.vm.badResponseRetries).toBe(0);
    });
});
