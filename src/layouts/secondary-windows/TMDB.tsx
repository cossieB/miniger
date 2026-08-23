import { CircleQuestionMarkIcon, EyeIcon, EyeOffIcon } from "lucide-solid"
import styles from "./TMDB.module.css"
import { createSignal, Show, Suspense } from "solid-js"
import { invoke } from "@tauri-apps/api/core"
import { action, createAsync, json, query, useAction } from "@solidjs/router"
import { HoldClickBtn } from "~/components/HoldClickBtn"
import { Dynamic } from "solid-js/web"

export const getApiKey = query(async () => {
    try {
        return await invoke<string | null>('get_password')
    } catch (error) {
        console.error(error)
        return null
    }
}, "getApiKey")

const saveKeyAction = action(async (key: string) => {
    await invoke("set_password", {
        password: key
    })
    return json(null, { revalidate: [getApiKey.key] })
})

const deleteKeyAction = action(async () => {
    await invoke("delete_password")
    return json(null, { revalidate: [getApiKey.key] })
})

export function TMDB() {
    let textarea!: HTMLTextAreaElement
    const existing = createAsync(() => getApiKey())
    const saveKey = useAction(saveKeyAction)
    const deleteKey = useAction(deleteKeyAction);
    const [showKey, setShowKey] = createSignal(false)
    const [key, setKey] = createSignal("")
    const [testResult, setTestResult] = createSignal<any>()
    const [loading, setLoading] = createSignal(false)

    const isValid = () => testResult()?.success === true

    const handleTest = async () => {
        setLoading(true)
        try {
            const res = await testApiKey(key())
            setTestResult(res)
        } catch (error) {

        }
        finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: SubmitEvent) => {
        e.preventDefault()
        setTestResult()
        setLoading(true);
        try {
            await saveKey(key().trim())
            setKey("")
            setShowKey(false)
        } catch (error) {
            setTestResult(error)
        }
        finally {
            setLoading(false)
        }
    }

    const displayedKey = () => {
        if (showKey()) return existing.latest ?? ""
        return existing()?.slice(0, existing()!.indexOf(".")).padEnd(existing()!.length - existing()!.indexOf("."), "\u25CF") ?? ""
    }

    return (
        <Suspense>

            <div class={styles.tmdb} oncontextmenu={e => e.preventDefault()}>
                <form onsubmit={handleSave}>
                    <label>
                        API Read Access Token &nbsp;
                        <button type="button" popovertarget="tmdb-notice"> <CircleQuestionMarkIcon size={16} /> </button>
                    </label>
                    <div class={styles.textareaWrapper}>
                        <textarea
                            ref={textarea}
                            onInput={e => {
                                setKey(e.currentTarget.value);
                                setTestResult()
                            }}
                            placeholder="ey......"
                            oncontextmenu={async () => {
                                const text = await navigator.clipboard.readText();
                                setKey(text)
                            }}                                    
                            value={key() || displayedKey()}
                        >
                        </textarea>
                        <Show when={existing()}>
                            <button
                                onClick={() => {
                                    setShowKey(prev => !prev)
                                }}
                                type="button"
                            >
                                <Dynamic component={showKey() ? EyeOffIcon : EyeIcon} />
                            </button>
                        </Show>
                    </div>
                    <div class={styles.btns}>
                        <button onClick={handleTest} disabled={!key() || loading()} type="button">Test</button>
                        <Show when={isValid()}>
                            <button disabled={!key() || loading()} type="submit">Save</button>
                        </Show>
                        <Show when={existing()}>
                            <HoldClickBtn
                                type="danger"
                                label="Delete Key"
                                action={async () => {
                                    await deleteKey();
                                    setShowKey(false)
                                    setKey("")                                    
                                    setLoading(false)
                                    setTestResult()
                                }}
                            />
                        </Show>
                    </div>
                </form>
                <pre>
                    {JSON.stringify(testResult(), null, 4)}
                </pre>
                <ApiNotice />
            </div>
        </Suspense>
    )
}

async function testApiKey(key: string) {
    const url = 'https://api.themoviedb.org/3/authentication';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${key}`
        }
    };
    try {
        const res = await fetch(url, options);
        const data = await res.json()
        return data
    } catch (error) {
        console.error(error)
    }
}

function ApiNotice() {
    return (
        <article class={styles.notice} popover id="tmdb-notice">
            <h2>Notice: TMDB API Key Required</h2>

            <p>To bring you the best movie details, posters, and cast information, this application uses data provided by{" "}
                <strong>The Movie Database (TMDB)</strong>. To access this data, you will need to provide a personal TMDB API Key.
            </p>

            <p>Here is everything you need to know about what it is, how to get one, and how we keep it safe.</p>

            <h3>What is an API Key and why is it needed?</h3>
            <p>An API (Application Programming Interface) Key is essentially a special password or digital passport. Because TMDB
                receives millions of requests for movie data every day, they use API keys to manage and authenticate who is asking
                for the information.</p>
            <p>By using your own personal API key, our app gets permission to "talk" to TMDB and fetch the movie information you
                want to see, directly on your behalf.</p>

            <h3>How to get your free TMDB API Key</h3>
            <p>Getting an API key is completely free and only takes a few minutes:</p>
            <ol>
                <li><strong>Create an account:</strong> Go to <a href="https://www.themoviedb.org/" target="_blank"
                    rel="noopener noreferrer">https://www.themoviedb.org/</a> and sign up for a free account.</li>
                <li><strong>Go to Settings:</strong> Once logged in, click on your profile icon in the top right corner and select{" "}
                    <strong>Settings</strong>.</li>
                <li><strong>Find the API section:</strong> In the left-hand menu, click on <strong>API</strong>.</li>
                <li><strong>Request a Key:</strong> Click on the link to <strong>Request an API Key</strong> and choose the{" "}
                    <strong>Developer</strong> option.</li>
                <li><strong>Fill out the form:</strong> Accept the terms and fill out the brief form. (If it asks for an application
                    name or URL, you can simply use the name of this app).</li>
                <li><strong>Copy your Key:</strong> Once you submit the form, your key will be generated immediately. Copy the{" "}
                    <strong>API Read Access Token</strong> and paste it into the designated field in our application.</li>
            </ol>

            <h3>Your Privacy and Security Guarantee</h3>
            <p>We understand that handling personal keys requires trust, and we want to be completely transparent about how your
                data is handled:</p>
            <ul>
                <li><strong>Stored Locally:</strong> Your API key is stored securely <em>only on your own computer/device</em>.</li>
                <li><strong>Direct Communication:</strong> Your key is only ever used to communicate directly with the <a
                    href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">https://www.themoviedb.org/</a> API
                    to fetch movie data.</li>
                <li><strong>Never Shared:</strong> Your key will <strong>never</strong> be sent to our servers, seen by our
                    developers, or shared with any other third parties.</li>
            </ul>
        </article>
    )
}