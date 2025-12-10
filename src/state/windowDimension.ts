import { createStore } from "solid-js/store";

const [windowDimensions, setWindowDimensions] = createStore({
     width: window.innerWidth,
        height: window.innerHeight,
        set: (dimensions: { width?: number, height?: number }) => {
            setWindowDimensions(prev => ({ ...prev, ...dimensions }))
        }
})

export {windowDimensions}