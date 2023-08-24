import { Header } from "../src/components/Header"
import { dialogSettingsContext } from "../src/helpers/dialogContext"

import { useState, useContext } from "react"

const SendReminder = () => {
    const [MCTrackingExcelFile, setMCTrackingExcelFile] = useState({ name: null, content: null })
    const [running, setRunning] = useState(false)
    const [success, setSuccess] = useState(false)
    const [InvalidHPExcelURL, setInvalidHPExcelURL] = useState()
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

            setSuccess(false)
            setInvalidHPExcelURL(null)
            setUnsentRemindersExcelURL(null)

            if (!MCTrackingExcelFile.content) {
                // Show error in dialog
                displayErrorDialog({
                    name: "MC TRACKING EXCEL FILE NOT UPLOADED",
                    message: "Please upload the MC tracking Excel file before running the program."
                })
                return
            }

            const response = await window.myAPI.sendReminders(MCTrackingExcelFile.content)

            if (response.status == 500) {
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setUnsentRemindersExcelURL(url)
                displayErrorDialog({
                    name: "BROWSER WAS CLOSED PREMATURELY",
                    message: "The browser was closed before the reminders for all MC records were sent. \nThe excel sheet under the 'Run' button contains the remaining MC records. You can upload this and click 'Run' to send the remaining messages."
                })

            } else if (response.status == 504) {
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setUnsentRemindersExcelURL(url)
                displayErrorDialog({
                    name: "SERVER TIMEOUT",
                    message: "You probably minimised the browser or took too long to scan the Whatsapp Web QR code. You should always open another desired tab on top of the browser instead of minimising it because doing so will pause the program.\nThe excel sheet under the 'Run' button contains the remaining MC records. You can upload this and click 'Run' to send the remaining messages."
                })

            } else if (response.attachmentBuffer) {
                const response_blob = new Blob([response.attachmentBuffer])
                const url = URL.createObjectURL(response_blob)
                setInvalidHPExcelURL(url)
                displayErrorDialog({
                    name: "One or more HP numbers were invalid",
                    message: "Reminder messages could not be sent to these HP numbers. The corresponding MC records can be found in the Excel file generated under the 'Run' button.\nPlease manually remind them via Whatsapp instead."
                })

            } else if (response.status == 400) {
                const {error} = response
                displayErrorDialog(error)

            } else if (response.status == 200){
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
                            {InvalidHPExcelURL ?
                                <>
                                    <p>{`Reminders could not be sent for some MC records due to invalid HP numbers :(`}</p>
                                    <p>
                                        <a className="underline text-cerulean hover:text-slate-300" href={InvalidHPExcelURL} download="MC records with invalid HP numbers.xlsx">{"Download these MC records (Excel File) "}</a>
                                        to see who to message manually!
                                    </p>
                                </>
                                :
                                <></>
                            }
                            {UnsentRemindersExcelURL ?
                                <>
                                    <p>{`Reminders were not sent for some MC records because the browser was closed prematurely :(`}</p>
                                    <p>
                                        <a className="underline text-cerulean hover:text-slate-300" href={UnsentRemindersExcelURL} download="Remaining MC records.xlsx">{"Download these MC records (Excel File) "}</a>
                                        and upload it to try again!
                                    </p>
                                </>
                                :
                                <></>

                            }
                            {success ?
                                <>
                                    <p>{`All reminders were successfully sent!`}</p>
                                </>
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