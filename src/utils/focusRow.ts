import { GridApi } from "ag-grid-community";

export function focusRow(id: string, gridApi: GridApi) {
    const node = gridApi.getRowNode(id);
    if (!node) return
    // unselect currently selected nodes
    gridApi.setNodesSelected({
        newValue: false, 
        nodes: gridApi.getSelectedNodes()
    })
    // select and scroll to this row
    node.setSelected(true)
    gridApi.ensureNodeVisible(node, 'middle')
}