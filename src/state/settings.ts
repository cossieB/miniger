import { createStore } from "solid-js/store";
import type { KeysWithValuesOfType } from "~/lib/utilityTypes";

const [settings, setSettings] = createStore({
    showThumbnail: false,
    toggleSetting: (setting: KeysWithValuesOfType<typeof settings, boolean>) => {
        setSettings(setting, prev => !prev)
    }
})

export {settings}