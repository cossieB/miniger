import { createStore } from "solid-js/store";

const [miniplayer, setMiniplayer] = createStore({
    video: null as { title: string, path: string } | null,
    setVideo: (video: { title: string, path: string } | null) => {
        setMiniplayer({video})
    },
    height: 300,
    setHeight: (height: number) => setMiniplayer({height})
})

export {miniplayer}