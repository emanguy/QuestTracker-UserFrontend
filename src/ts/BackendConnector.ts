import nonce from "nonce";
import {hash} from "bcryptjs";
import {
    GenericAdd,
    GenericDeletion,
    GenericUpdate,
    Quest,
    RestBodyObjective,
    RestBodyObjectiveUpdate,
    RestBodyQuest,
    RestBodyQuestUpdate
} from "common-interfaces/QuestInterfaces";
import {ErrorDescription, NewlyCreatedDescription} from "common-interfaces/RestResponses";
import {MessageType} from "common-interfaces/NotificationInterfaces";
import {AccessTokenRequest, LoginToken, NonceSaltPair} from 'common-interfaces';

export class BadHTTPCodeError extends Error {
    statusCode : number;

    constructor(message: string, statusCode: number) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

export class MalformedResponseError extends Error {
    constructor() {
        super();
        this.message = "Response was not JSON as expected!";
    }
}

export class MalformedBodyError extends Error {
    constructor() {
        super();
        this.message = "Body could not be serialized.";
    }
}

export class BackendOfflineError extends Error {
    constructor() {
        super();
        this.message = "Backend is offline!";
    }
}

export interface ApiCredentials {
    username: string
    authToken: string
}

enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

// TODO change this to HTTPS when Let's Encrypt is configured
function produceApiPath(path: string) : string {
    return `http://${process.env.VUE_APP_BACKEND_HOSTNAME_AND_PORT}${process.env.VUE_APP_BACKEND_API_ROOT_PATH}/${path}`;
}

function produceListenerPath(path: string) : string {
    return `http://${process.env.VUE_APP_BACKEND_UPDATE_HOSTNAME_AND_PORT}${process.env.VUE_APP_BACKEND_UPDATE_ROOT_PATH}/${path}`;
}

function applyAuthCredentials(credentials: ApiCredentials) : Record<string, string> {
    return {
        'x-username': credentials.username,
        'x-auth-token': credentials.authToken
    }
}

// I really should have used an actual HTTP library for this, but it works for what I'm doing. Whatever.
/**
 *
 * @throws BackendOfflineError if the backend api could not be reached
 * @throws BadHTTPCodeError if fetching the quest list throws a non-2xx status
 * @throws MalformedResponseError if an HTTP response is malformed
 * @throws MalformedBodyError if the provided body is not serializable
 */
async function backendTransaction<T = undefined, P = null>(path: string, method: HttpMethod = HttpMethod.GET, additionalHeaders: HeadersInit = {}, payload?: P, deserializeResponse: boolean = true) : Promise<T> {
    const backendUrl = produceApiPath(path);
    let payloadString: string|undefined;

    let serverResponse: Response|null = null;

    if (payload) {
        try {
            payloadString = JSON.stringify(payload);
        }
        catch(e) {
            throw new MalformedBodyError();
        }
    }

    try {

        if (payloadString === null) {
            serverResponse = await fetch(backendUrl, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...additionalHeaders
                }
            });
        }
        else {
            serverResponse = await fetch(backendUrl, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...additionalHeaders
                },
                body: payloadString
            });
        }
    }
    catch (err) {
        throw new BackendOfflineError();
    }

    if (!serverResponse.ok) {
        let errorDescription = null;
        try {
            const rawResponse = <ErrorDescription> await serverResponse.json();
            console.error(`Bad response from server. Status: ${serverResponse.status} Message: ${rawResponse.message}`);
            errorDescription = rawResponse.message;
        }
        catch (e) {
            errorDescription = "Server error";
            console.error("Backend sent non-standard error message. Could not retrieve more detail.");
        }

        throw new BadHTTPCodeError(errorDescription, serverResponse.status);
    }

    try {
        if (deserializeResponse) {
            return serverResponse.json();
        }
        else {
            return <any> serverResponse.text();
        }
    }
    catch (err) {
        throw new MalformedResponseError();
    }
}

/**
 * Retrieve the full task list from the backend or throw an error on bad HTTP statuses
 */
export async function getFullQuestList() : Promise<Quest[]> {
    return backendTransaction<Quest[]>("quests");
}

/**
 * Attempts to log into the backend using the given username and password
 *
 * @see backendTransaction Full list of errors that can be thrown
 *
 * @param username The username to log in with
 * @param password The password to log in with
 */
export async function loginWithCredentials(username: string, password: string) : Promise<ApiCredentials> {
    // Retrieve server and client nonces
    const serverNoncePromise = backendTransaction<NonceSaltPair>(`auth/${username}/nonce`);
    const clientNonceGenerator = nonce();
    const clientNonce = clientNonceGenerator();

    // Get the server nonce and user's salt, then generate the appropriate hash
    const serverNonceAndHash = await serverNoncePromise;
    const userPasswordHash = await hash(password, serverNonceAndHash.passwordSalt);

    // Generate the message to transmit, then hash it and send
    const rawLoginMessage = `${serverNonceAndHash.nonce.serverNonce}${clientNonce}${userPasswordHash}`;
    const hashedLoginMessagePromise = hash(rawLoginMessage, 10);

    // Generate login request with hashed login message
    const loginRequest: AccessTokenRequest = {
        clientNonce,
        serverNonceId: serverNonceAndHash.nonce.id,
        clientPasswordHash: await hashedLoginMessagePromise
    };

    // Perform login token transaction
    const token = await backendTransaction<LoginToken, AccessTokenRequest>(`auth/${username}/login`, HttpMethod.POST, undefined, loginRequest);
    return {username, authToken: token.loginToken};
}

export async function deauthCredentials(credentials: ApiCredentials) : Promise<void> {
    return backendTransaction(`auth/${credentials.username}/token/${credentials.authToken}`, HttpMethod.DELETE);
}

export async function createQuest(credentials: ApiCredentials, newQuest: RestBodyQuest) : Promise<void> {
    return backendTransaction<undefined, RestBodyQuest>("quests", HttpMethod.POST, applyAuthCredentials(credentials), newQuest, false);
}

export async function addObjectiveToQuest(credentials: ApiCredentials, questId: string, newObjective: RestBodyObjective) : Promise<NewlyCreatedDescription> {
    return backendTransaction<NewlyCreatedDescription, RestBodyObjective>(`quests/${questId}/objectives`, HttpMethod.POST, applyAuthCredentials(credentials), newObjective);
}

export async function modifyQuest(credentials: ApiCredentials, questId: string, updates: RestBodyQuestUpdate) : Promise<void> {
    return backendTransaction<undefined, RestBodyQuestUpdate>(`quests/${questId}`, HttpMethod.PUT, applyAuthCredentials(credentials), updates, false);
}

export async function modifyObjective(credentials: ApiCredentials, questId: string, objectiveId: string, updates: RestBodyObjectiveUpdate) : Promise<void> {
    return backendTransaction<undefined, RestBodyObjectiveUpdate>(`quests/${questId}/objectives/${objectiveId}`, HttpMethod.PUT, applyAuthCredentials(credentials), updates, false);
}

export async function deleteQuest(credentials: ApiCredentials, questId: string) : Promise<void> {
    return backendTransaction(`quests/${questId}`, HttpMethod.DELETE, applyAuthCredentials(credentials), undefined, false);
}

export async function deleteObjective(credentials: ApiCredentials, questId: string, objectiveId: string) : Promise<void> {
    return backendTransaction(`quests/${questId}/objectives/${objectiveId}`, HttpMethod.DELETE, applyAuthCredentials(credentials), undefined, false);
}

/**
 * Listens for quest updates on the backend and notifies the application with updates
 */
export class QuestUpdateListener {
    readonly createEventListeners: Array<(update: GenericAdd) => void> = [];
    readonly updateEventListeners: Array<(update: GenericUpdate) => void> = [];
    readonly deleteEventListeners: Array<(update: GenericDeletion) => void> = [];
    readonly errorEventListeners: Array<(err: Error) => void> = [];
    private _isListening: boolean = false;
    private eventListener: EventSource|null = null;
    private boundNewItemHandler = this.handleNewItems.bind(this);
    private boundUpdateHandler = this.handleUpdates.bind(this);
    private boundDeleteHandler = this.handleDeletions.bind(this);

    startListening() {
        if (this.eventListener == null) {
            this.eventListener = new EventSource(produceListenerPath("push/register"));

            this.eventListener.addEventListener(MessageType.DATA_NEW, this.boundNewItemHandler);
            this.eventListener.addEventListener(MessageType.DATA_UPDATE, this.boundUpdateHandler);
            this.eventListener.addEventListener(MessageType.DATA_REMOVED, this.boundDeleteHandler);
            this._isListening = true;
        }
    }

    stopListening() {
        if (this.eventListener != null) {
            this.eventListener.removeEventListener(MessageType.DATA_NEW, this.boundNewItemHandler);
            this.eventListener.removeEventListener(MessageType.DATA_UPDATE, this.boundUpdateHandler);
            this.eventListener.removeEventListener(MessageType.DATA_REMOVED, this.boundDeleteHandler);

            this.eventListener = null;
            this._isListening = false;
        }
    }

    public get isListening() {
        return this._isListening;
    }

    private handleUpdate<T>(message: Event, listenerList: Array<(update: T) => void>) {
        let actualEvent = <MessageEvent> message;

        try {
            let deserializedData: T = JSON.parse(actualEvent.data);
            for (let listenerFunction of listenerList) {
                listenerFunction(deserializedData);
            }
        }
        catch(err) {
            for (let listenerFunction of this.errorEventListeners) {
                listenerFunction(err);
            }
        }
    }

    private handleNewItems(message: Event) {
        this.handleUpdate<GenericAdd>(message, this.createEventListeners);
    }

    private handleUpdates(message: Event) {
        this.handleUpdate<GenericUpdate>(message, this.updateEventListeners);
    }

    private handleDeletions(message: Event) {
        this.handleUpdate<GenericDeletion>(message, this.deleteEventListeners);
    }
}