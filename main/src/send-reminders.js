import puppeteer from 'puppeteer';

var XLSX = require('xlsx');
const { performance } = require('perf_hooks');
const Store = require('electron-store');

const MIN_DELAY_AFTER_INIT_FETCH = 15 * 1000 // milliseconds
const MIN_DELAY_AFTER_LOAD = 10 * 1000 // milliseconds
const MIN_DELAY_BEFORE_NEXT_RECORD = 5 * 1000 // milliseconds

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

const DEFAULT_MESSAGE_TEMPLATES = {
    HL: "Hi {rank} {name}, I am CPL Eugene from 30SCE's S1 department. Please kindly *send me a picture/softcopy* of your hospitalisation leave *({mc start} to {mc end})* so that way I can have it filed for you.\n \nThanks!",
    MC: "Hi {rank} {name}, I am CPL Eugene from 30SCE's S1 department. Have you submitted your MC *({mc start} to {mc end})* via NS Portal/ESS? Once done, *please send me a screenshot of the submission receipt*.\n \nThanks!"
}

const DEFAULT_DATA_TEST_ID_SELECTORS = {
    "Valid HP": '::-p-aria([name="Send"][role="button"])',
    "Invalid HP": '::-p-aria([name="OK"][role="button"])'
}

const generateExcelWBBuffer = (records, wbTitle, headerMappings) => {
    var wb = XLSX.utils.book_new()
    wb.Props = {
        Title: wbTitle,
    }
    wb.SheetNames.push("Raw Data")
    const wsData = [
        [headerMappings["Rank"], headerMappings["Name"], headerMappings["HP Number"], headerMappings["MC Type"],
        headerMappings["MC from a SAF Medical Centre?"], headerMappings["MC Start Date"], headerMappings["MC End Date"],
        headerMappings["Submitted MC?"]],
        ...records
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    wb.Sheets["Raw Data"] = ws
    return XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
}

export const sendReminders = async (event, binaryExcel) => {
    try {
        // Initialisation
        const store = new Store();

        if (!store.get("Message Templates")) store.set("Message Templates", DEFAULT_MESSAGE_TEMPLATES)

        const MESSAGE_TEMPLATES = store.get("Message Templates")
        const HL_MESSAGE_TEMPLATE = MESSAGE_TEMPLATES["HL"]
        const MC_MESSAGE_TEMPLATE = MESSAGE_TEMPLATES["MC"]

        if (!store.get("Data Test ID Selectors")) store.set("Data Test ID Selectors", DEFAULT_DATA_TEST_ID_SELECTORS)
        //store.set("Data Test ID Selectors", DEFAULT_DATA_TEST_ID_SELECTORS) // Remove during prod
        const DATA_TEST_ID_SELECTORS = store.get("Data Test ID Selectors")
        const INVALID_HP_DATA_TEST_ID_SELECTOR = DATA_TEST_ID_SELECTORS["Invalid HP"]
        const VALID_HP_DATA_TEST_ID_SELECTOR = DATA_TEST_ID_SELECTORS["Valid HP"]

        // Paramter Validation
        const workbook = XLSX.read(binaryExcel, { type: "binary", cellText: false, cellDates: true });

        var MCTrackingSheet = workbook.Sheets["Raw Data"]
        if (!MCTrackingSheet) {
            return ({
                status: 400,
                error: { name: 'Sheet named "Raw Data" could not be found', message: 'Please rename the main sheet in the uploaded Excel file to "Raw Data"' }
            })
        }

        const [sheetHeaders] = XLSX.utils.sheet_to_json(MCTrackingSheet, { header: 1 })
        if (!store.get("Column Headers")) store.set("Column Headers", DEFAULT_COLUMN_HEADERS)

        var headerMappings = store.get("Column Headers")
        const requiredHeaders = [
            headerMappings["Rank"], headerMappings["Name"], headerMappings["HP Number"], headerMappings["MC Type"],
            headerMappings["MC from a SAF Medical Centre?"], headerMappings["MC Start Date"], headerMappings["MC End Date"],
            headerMappings["Submitted MC?"]
        ]
        const missingHeaders = requiredHeaders.filter(header => !sheetHeaders.includes(header))
        if (missingHeaders.length > 0) {
            return ({
                status: 400,
                error: { name: 'Column header(s) missing', message: `The following header(s) could not be found: ${missingHeaders.map(header => `"${header}"`).join(", ")}. \nYou can either rename the column header(s) in your uploaded excel sheet to the missing column header(s) (reupload after saving the changes!), or go to Home Page --> Settings --> Column Headers to change the missing column header(s) to match your current header(s).` }
            })
        }

        // Execution
        MCTrackingSheet = XLSX.utils.sheet_to_json(MCTrackingSheet, { raw: false, dateNF: 'dd/mm/yyyy' });

        // Filter for records which were not from SAF Medical Centre and have not been confirmed to be submitted
        MCTrackingSheet = MCTrackingSheet.filter(record => (!record[headerMappings["Submitted MC?"]]?.trim() && record[headerMappings["MC from a SAF Medical Centre?"]] == "No"))

        let options = {
            defaultViewport: null,
            headless: false,
            args: [
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        }
        if (__dirname.includes('resources')) { // if production mode. In dev mode, chromium is alr installed in User/.cache/puppeteer
            options.executablePath = __dirname.split('app.asar')[0] + 'node_modules/puppeteer/.local-chromium/win64-115.0.5790.170/chrome-win64/chrome.exe'
        }

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();

        var invalidHPMCRecords = []
        var urgentMCRecords = []
        for (let i = 0; i < MCTrackingSheet.length; i++) {
            //console.log("Started search for selector")
            const record = MCTrackingSheet[i]

            // Create a slice of the record that can be added to an excel sheet if needed
            const slicedRecord = [
                record[headerMappings["Rank"]], record[headerMappings["Name"]], record[headerMappings["HP Number"]], record[headerMappings["MC Type"]],
                record[headerMappings["MC from a SAF Medical Centre?"]], record[headerMappings["MC Start Date"]], record[headerMappings["MC End Date"]],
                record[headerMappings["Submitted MC?"]]
            ]

            // If the phone number is invalid (less than 8 chars), skip and add to the Invalid HP excel sheet
            if (!record[headerMappings["HP Number"]] || !Number.isInteger(Number(record[headerMappings["HP Number"]].replace(/\s/g, ''))) || record[headerMappings["HP Number"]].length < 8) {
                invalidHPMCRecords.push(slicedRecord)
                continue
            }

            const [day, month, year] = record[headerMappings["MC Start Date"]].split("/")
            const McStartDateObject = new Date(Number(year), Number(month) - 1, Number(day))
            const todayObject = new Date()

            // If the MC Start Date is in the future, do not send a reminder for it
            if (McStartDateObject > todayObject) continue

            // If the deadline (14 days after MC Start Date) is over, do not send a reminder for it
            if (new Date(McStartDateObject.getTime() + 14 * 24 * 60 * 60 * 1000) < todayObject) continue

            // If today is 9 or more days after the MC Start Date (5 or less days left), add it to the Urgent MC excel sheet
            // We want the operator (MC clerk) to personally message and spam call the people and have them submit the MC asap
            // An automated message will still be sent for good measure
            if (new Date(McStartDateObject.getTime() + 9 * 24 * 60 * 60 * 1000) <= todayObject) {
                urgentMCRecords.push(slicedRecord)
                continue
            }

            // Prepare the record's HP and reminder message
            const ph_num = record[headerMappings["HP Number"]].replace(/\s/g, '').length == 8 ? `+65${record[headerMappings["HP Number"]]}` : `+${record[headerMappings["HP Number"]]}`

            const message_template = record[headerMappings["MC Type"]] == "HL" ? HL_MESSAGE_TEMPLATE : MC_MESSAGE_TEMPLATE
            const message = message_template
                .replace(/\{rank\}/gi, record[headerMappings["Rank"]])
                .replace(/\{name\}/gi, record[headerMappings["Name"]])
                .replace(/\{mc start\}/gi, record[headerMappings["MC Start Date"]])
                .replace(/\{mc end\}/gi, record[headerMappings["MC End Date"]])

            // Ensure that each message takes at least 15 seconds to send to evade the spam detection algorithm
            const startTime = performance.now()

            await page.goto(`https://web.whatsapp.com/send?phone=${ph_num}&text=${encodeURIComponent(message)}`);
            await page.setDefaultTimeout(0);

            const isValidHP = await Promise.race([
                page.waitForSelector(VALID_HP_DATA_TEST_ID_SELECTOR).then(res => { return new Promise((res, rej) => { res(true) }) }),
                page.waitForSelector(INVALID_HP_DATA_TEST_ID_SELECTOR).then(res => { return new Promise((res, rej) => { res(false) }) })
            ])

            if (!isValidHP) {
                //console.log("OK button detected, waiting 5 seconds before continuing")
                invalidHPMCRecords.push(slicedRecord)
                await new Promise(r => setTimeout(r, MIN_DELAY_BEFORE_NEXT_RECORD))
                //console.log("continued")
                continue
            }

            const endTime = performance.now()
            if (((endTime - startTime) + MIN_DELAY_AFTER_LOAD) < MIN_DELAY_AFTER_INIT_FETCH) {
                //console.log(`Send button detected, waiting ${(MIN_DELAY_AFTER_INIT_FETCH - (endTime - startTime))/1000} seconds before clicking enter`)
                await new Promise(r => setTimeout(r, MIN_DELAY_AFTER_INIT_FETCH - (endTime - startTime)))
            } else {
                //console.log(`Send button detected, waiting ${MIN_DELAY_AFTER_LOAD/1000}  seconds before clicking enter`)
                await new Promise(r => setTimeout(r, MIN_DELAY_AFTER_LOAD))
            }
            //console.log("Clicked Enter")
            await page.keyboard.press("Enter")
            await new Promise(r => setTimeout(r, MIN_DELAY_BEFORE_NEXT_RECORD))

            record["Sent Reminder"] = "Yes"

        }

        browser.close()

        if (urgentMCRecords.length != 0 && invalidHPMCRecords.length != 0) {
            const data = [
                [],
                ["URGENT ATTENTION REQUIRED"],
                [],
                ...urgentMCRecords,
                [],
                ["Invalid HPs"],
                [],
                ...invalidHPMCRecords
            ]
            const urgentMCandInvalidHPWBBuffer = generateExcelWBBuffer(data, "Urgent MC records & MC records with invalid HP numbers", headerMappings)
            return ({
                status: 200,
                remarks: "Urgent Attention Required & Invalid HPs",
                attachmentBuffer: urgentMCandInvalidHPWBBuffer
            })

        } else if (invalidHPMCRecords.length != 0) {
            const invalidHPWBBuffer = generateExcelWBBuffer(invalidHPMCRecords, "MC records with invalid HP numbers", headerMappings)
            return ({
                status: 200,
                remarks: "Invalid HPs",
                attachmentBuffer: invalidHPWBBuffer
            })

        } else if (urgentMCRecords.length != 0) {
            const urgentMCWBBuffer = generateExcelWBBuffer(urgentMCRecords, "Urgent MC records", headerMappings)
            return ({
                status: 200,
                remarks: "Urgent Attention Required",
                attachmentBuffer: urgentMCWBBuffer
            })

        } else {
            return ({
                status: 200
            })
        }

    } catch (error) {
        console.log("Error occurred")
        console.log(error)
        const remainingMCRecords = MCTrackingSheet
            .filter(record => !record["Sent Reminder"]) // filter for the records which were not marked as "Sent"
            .map(record => [
                record[headerMappings["Rank"]], record[headerMappings["Name"]], record[headerMappings["HP Number"]], record[headerMappings["MC Type"]],
                record[headerMappings["MC from a SAF Medical Centre?"]], record[headerMappings["MC Start Date"]], record[headerMappings["MC End Date"]],
                record[headerMappings["Submitted MC?"]]
            ])
        const unsentRemindersWBBuffer = generateExcelWBBuffer(remainingMCRecords, "Remaining MC records", headerMappings)

        let resStatus
        if (error.name == "ProtocolError") {
            resStatus = 504 // ProtocolError usually indicates a server timeout error
        } else if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
            resStatus = 503 // Service Unavailable due to loss of connection
        } else {
            resStatus = 500
        }
        return ({
            status: resStatus,
            attachmentBuffer: unsentRemindersWBBuffer,
            error: error
        })
    }
}