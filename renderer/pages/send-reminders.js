import { Header } from "../src/components/Header"
import { dialogSettingsContext } from "../src/helpers/dialogContext"

import { useState, useContext } from "react"

const SendReminder = () => {
    const [MCTrackingExcelFile, setMCTrackingExcelFile] = useState({ name: null, content: null })
    const [running, setRunning] = useState(false)
    const [success, setSuccess] = useState(false)
    const [InvalidHPExcelURL, setInvalidHPExcelURL] = useState()
    const [UrgentExcelURL, setUrgentExcelURL] = useState()
    const [UnsentRemindersExcelURL, setUnsentRemindersExcelURL] = useState()

    const { setDialogSettings, closeDialog, displayErrorDialog } = useContext(dialogSettingsContext)

    const onUploadMCTrackingExcelFile = async (e) => {

        const fileReader = new FileReader();
        fileReader.onload = async () => {
            if (fileReader.readyState === 2) {

                try {
                    /*
                    // Excel sheet validation
                    const response = await fetch("/api/validate-excel", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({}) 
                    })
                    
                    if (response.status != 200) {
                        // Show error in a dialog
                    }
                    */
                    setMCTrackingExcelFile({
                        name: e.target.files[0].name,
                        content: fileReader.result
                    });

                    setSuccess(false)
                    setInvalidHPExcelURL(null)
                    setUrgentExcelURL(null)
                    setUnsentRemindersExcelURL(null)
                } catch {
                    // Show error in a dialog
                }

            }
        };
        fileReader.readAsBinaryString(e.target.files[0]);
    }

    const onRunAutoMessager = async () => {

        try {
            if (running) return
            setRunning(true)

            if (!MCTrackingExcelFile.content) {
                // Show error in dialog
                displayErrorDialog({
                    name: "MC TRACKING EXCEL FILE NOT UPLOADED",
                    message: "Please upload the MC tracking Excel file before running the program."
                })
                return
            }

            // Only reset the below states after it is confirmed that the excel sheet has been uploaded
            // This way, users will have the chance to download any of the generated excel sheets if they failed to 
            // do so previously
            setSuccess(false)
            setInvalidHPExcelURL(null)
            setUrgentExcelURL(null)
            setUnsentRemindersExcelURL(null)

            const response = await window.myAPI.sendReminders(MCTrackingExcelFile.content)

            setMCTrackingExcelFile({ name: null, content: null }) // Reset file upload

            if (response.status == 500) {
                console.log(response.error)
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setUnsentRemindersExcelURL(url)
                displayErrorDialog({
                    name: "BROWSER WAS CLOSED PREMATURELY/COMPUTER WENT TO SLEEP",
                    message:
                        <>
                            <p>{`The browser was closed/the computer went to sleep before the reminders for all MC records were sent.`}</p>
                            <p><a className="underline text-cerulean hover:text-slate-300" href={url} download="Remaining MC records.xlsx">{"Click here "}</a>
                                {`to download an Excel file containing the remaining MC records.`}</p>
                            <p className="font-bold">{`You should upload this and click 'Run' to send the remaining messages.`}</p>
                            <p>{`The excel sheet is also available under the 'Run' button if you are still on the "Send Reminders" page.`}</p>
                        </>
                })

            } else if (response.status == 504) {
                console.log(response.error)
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setUnsentRemindersExcelURL(url)
                displayErrorDialog({
                    name: "SERVER TIMEOUT",
                    message:
                        <>
                            <p>{`You probably minimised the browser or took too long to scan the Whatsapp Web QR code. You should always open another desired tab on top of the browser instead of minimising it because doing so will pause the program.`}</p>
                            <p><a className="underline text-cerulean hover:text-slate-300" href={url} download="Remaining MC records.xlsx">{"Click here "}</a>
                                {`to download an Excel file containing the remaining MC records.`}</p>
                            <p className="font-bold">{`You should upload this and click 'Run' to send the remaining messages.`}</p>
                            <p>{`The excel sheet is also available under the 'Run' button if you are still on the "Send Reminders" page.`}</p>
                        </>
                })

            } else if (response.status == 400) {
                const { error } = response
                displayErrorDialog(error)

            } else if (response.status == 200 && response.remarks == "Urgent Attention Required & Invalid HPs") {
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setUrgentExcelURL(url)
                setInvalidHPExcelURL(url)

                displayErrorDialog({
                    name: "URGENT ATTENTION REQUIRED & INVALID HP NUMBERS",
                    message:
                        <>
                            <p>{`The deadline for one or more MCs is in less than 4 days. Additionally, one or more HP numbers were invalid.`}</p>
                            <p><a className="underline text-cerulean hover:text-slate-300" href={url} download="Urgent MC records & MC records with invalid HP numbers.xlsx">{"Click here "}</a>
                                {`to download an Excel file containing these MC records.`}</p>
                            <p className="font-bold">{`Please personally message them instead. Make sure to spam call those that are 1 to 2 days away from the deadline!`}</p>
                            <p>{`The excel sheet is also available under the 'Run' button if you are still on the "Send Reminders" page.`}</p>
                        </>
                })

            } else if (response.status == 200 && response.remarks == "Invalid HPs") {
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setInvalidHPExcelURL(url)
                displayErrorDialog({
                    name: "One or more HP numbers were invalid",
                    message:
                        <>
                            <p>{`Reminder messages could not be sent to one or more HP numbers.`}</p>
                            <p><a className="underline text-cerulean hover:text-slate-300" href={url} download="MC records with invalid HP numbers.xlsx">{"Click here "}</a>
                                {`to download an Excel file containing the corresponding MC records.`}</p>
                            <p className="font-bold">{`Please manually remind them via Whatsapp instead.`}</p>
                            <p>{`The excel sheet is also available under the 'Run' button if you are still on the "Send Reminders" page.`}</p>
                        </>
                })

            } else if (response.status == 200 && response.remarks == "Urgent Attention Required") {
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setUrgentExcelURL(url)
                displayErrorDialog({
                    name: "URGENT ATTENTION REQUIRED",
                    message:
                        <>
                            <p>{`The deadline for one or more MCs is in less than 4 days.`}</p>
                            <p><a className="underline text-cerulean hover:text-slate-300" href={url} download="Urgent MC records.xlsx">{"Click here "}</a>
                                {`to download an Excel file containing these MC records.`}</p>
                                <p className="font-bold">{` Please personally message them instead. Make sure to spam call those that are 1 to 2 days away from the deadline!`}</p>
                            <p>{`The excel sheet is also available under the 'Run' button if you are still on the "Send Reminders" page.`}</p>
                        </>
                })

            } else if (response.status == 200) {
                setDialogSettings({
                    title: "SUCCESS",
                    message: "All reminders were successfully sent!",
                    buttons: [{ text: "Close", bg: "bg-cerulean", callback: closeDialog }],
                    display: true
                })
                setSuccess(true)
            }

        } catch (error) {
            displayErrorDialog(error)
        } finally {
            setRunning(false)
        }
    }

    return (
        <>
            <Header title={"Send Reminders"} subtitle={'Upload the MC tracking Excel File and click "Run"'} prevPage={"/"} />
            <main className='h-auto flex items-center justify-center'>
                <div className="flex flex-col gap-10">
                    <div className='flex flex-col gap-3 items-center'>
                        <label htmlFor="file-upload" className={"p-4 text-white text-xl bg-green-500 rounded-lg hover:bg-green-200"}>
                            Upload MC tracking Excel file
                            <input
                                type="file"
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                id="file-upload"
                                className="hidden"
                                onChange={(event) => onUploadMCTrackingExcelFile(event)}
                                onClick={(event) => { event.target.value = '' }}
                            />
                        </label>
                        {MCTrackingExcelFile.content ?
                            <p className="text-sm">{MCTrackingExcelFile.name}</p>
                            :
                            <p className="text-sm">No file uploaded</p>
                        }
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                        <button
                            onClick={onRunAutoMessager}
                            className="bg-platinum hover:bg-slate-100 text-xl py-3 px-6 rounded-lg w-fit mx-auto"
                        >
                            {running ? "Running..." : "Run"}
                        </button>
                        <div>
                            {InvalidHPExcelURL && UrgentExcelURL ?
                                <div className="mx-auto w-3/4">
                                    <p className="font-bold">{`You have URGENT MCs and invalid HP numbers!`}</p>
                                    <p>
                                        <a className="underline text-cerulean hover:text-slate-300" href={InvalidHPExcelURL} download="Urgent MC records & MC records with invalid HP numbers.xlsx">{"Download these MC records (Excel File) "}</a>
                                        to see who to personally message. Make sure to spam call those whose MCs are 1 to 2 days away from the deadline until they submit their MCs!
                                    </p>
                                </div>
                                :
                                <></>
                            }
                            {InvalidHPExcelURL && !UrgentExcelURL ?
                                <div>
                                    <p className="font-bold">{`Reminders could not be sent for some MC records due to invalid HP numbers :(`}</p>
                                    <p>
                                        <a className="underline text-cerulean hover:text-slate-300" href={InvalidHPExcelURL} download="MC records with invalid HP numbers.xlsx">{"Download these MC records (Excel File) "}</a>
                                        to see who to message manually!
                                    </p>
                                </div>
                                :
                                <></>
                            }
                            {UrgentExcelURL && !InvalidHPExcelURL ?
                                <div className="mx-auto w-3/4">
                                    <p className="font-bold">{`THE DEADLINE OF ONE OR MORE MCs IS IN LESS THAN 4 DAYS!`}</p>
                                    <p>
                                        <a className="underline text-cerulean hover:text-slate-300" href={UrgentExcelURL} download="Urgent MC records.xlsx">{"Download these MC records (Excel File) "}</a>
                                        to see who to personally message. Make sure to spam call those whose MCs are 1 to 2 days away from the deadline until they submit their MCs!
                                    </p>
                                </div>
                                :
                                <></>
                            }
                            {UnsentRemindersExcelURL ?
                                <div>
                                    <p className="font-bold">{`Reminders were not sent for some MC records because the browser was closed prematurely :(`}</p>
                                    <p>
                                        <a className="underline text-cerulean hover:text-slate-300" href={UnsentRemindersExcelURL} download="Remaining MC records.xlsx">{"Download these MC records (Excel File) "}</a>
                                        and upload it to try again!
                                    </p>
                                </div>
                                :
                                <></>

                            }
                            {success ?
                                <div>
                                    <p>{`All reminders were successfully sent!`}</p>
                                </div>
                                :
                                <></>
                            }
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default SendReminder