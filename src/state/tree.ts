import { createStore } from "solid-js/store";

const [tree, setTree] = createStore({    
        width: 150,
        setWidth: (width: number) => {
            setTree({width})
        }
    
})

export {tree}