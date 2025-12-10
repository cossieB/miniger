import { type GridApi } from "ag-grid-community";
import { type Require } from "../lib/utilityTypes";
import { mainPanel } from "./mainPanel";
import { sidePanel } from "./sidePanel";
import { tree } from "./tree";
import {status} from "./status"
import { windowDimensions } from "./windowDimension";
import { miniplayer } from "./miniplayer";
import { settings } from "./settings";

export type PlaylistFile = {
    filmId?: number;
    title: string;
    path: string;
    cantPlay?: boolean,
    rowId?: string
};

export type ExtraProps = {
    isSelected: boolean,
    selectedLast: boolean,
    lastDraggedOver: boolean
}

export type SidepanelFile = ExtraProps & Require<PlaylistFile, 'rowId'>

export const state = {
    _gridApi: undefined as GridApi<any> | undefined,
    setGridApi: (g: GridApi<any> | undefined) => {
        state._gridApi = g
    },
    get gridApi () {
        return state._gridApi
    },
    status,
    sidePanel,
    mainPanel,
    tree,
    windowDimensions,
    miniplayer,
    settings
}