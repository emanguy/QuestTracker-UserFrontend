import nonce from "nonce";
import {hash} from "bcryptjs";
import {GenericAdd, GenericDeletion, GenericUpdate, Quest} from "common-interfaces/QuestInterfaces";
import {ErrorDescription} from "common-interfaces/RestResponses";
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

function produceApiPath(path: string) : string {
    return `http://${process.env.VUE_APP_BACKEND_HOSTNAME_AND_PORT}${process.env.VUE_APP_BACKEND_API_ROOT_PATH}/${path}`;
}

function produceListenerPath(path: string) : string {
    return `http://${process.env.VUE_APP_BACKEND_UPDATE_HOSTNAME_AND_PORT}${process.env.VUE_APP_BACKEND_API_ROOT_PATH}/${path}`;
}

/**
 *
 * @throws BackendOfflineError if the backend api could not be reached
 * @throws BadHTTPCodeError if fetching the quest list throws a non-2xx status
 * @throws MalformedResponseError if an HTTP response is malformed
 * @throws MalformedBodyError if the provided body is not serializable
 */
async function backendTransaction<T, P = null>(path: string, method: string = "GET", additionalHeaders: HeadersInit = {}, payload?: P) : Promise<T> {
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
        return serverResponse.json();
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
    const token = await backendTransaction<LoginToken, AccessTokenRequest>(`auth/${username}/login`, "POST", undefined, loginRequest);
    return {username, authToken: token.loginToken};
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