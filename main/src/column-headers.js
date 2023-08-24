const Store = require('electron-store');

const DEFAULT_COLUMN_HEADERS = {
    "Rank": "Rank",
    "Name": "Official Full Name (Can Edit)",
    "HP Number": "HP Number",
    "MC Type": "Type",
    "MC from a SAF Medical Centre?": "MC from JCMC/PLMC?",
    "MC Start Date": "MC Start Date",
    "MC End Date": "MC End Date",
    "Submitted MC?": "Completed"
}

export const getColumnHeaders = () => {
    const store = new Store()

    if (!store.get("Column Headers")) store.set("Column Headers", DEFAULT_COLUMN_HEADERS)
    const initColumnHeaders = store.get("Column Headers") 
    return initColumnHeaders 
}

export const updateColumnHeaders = (columnHeaders) => {
    const store = new Store()
    store.set("Column Headers", columnHeaders)
}

