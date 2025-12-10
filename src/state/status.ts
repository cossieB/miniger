import { createStore } from "solid-js/store";

export const [status, setStatus] = createStore({    
        message: "",
        timerId: -1,
        setStatus: (newStatus: string, autoFade = false) => {
            clearTimeout(status.timerId)
            let timerId = -1
            if (autoFade)
                timerId = setTimeout(() => {
                    setStatus('message', "")
                }, 5000)
            setStatus({
                ...status,
                message: newStatus,
                timerId
            })
        },
        clear: () => {
            setStatus({
                message: "",
                timerId: -1,
            })
        }
    
})