import { Header } from '../../src/components/Header';
import { dialogSettingsContext } from "../../src/helpers/dialogContext"

import { useState, useContext, useEffect } from 'react';
import { useFormik } from "formik";
import Yup from "../../src/helpers/Yup"
import { FormErrorDisplay } from '../../src/components/FormErrorDisplay';

function ColumnHeaders() {
    const [editMode, setEditMode] = useState(true)
    const { setDialogSettings, closeDialog, displayErrorDialog } = useContext(dialogSettingsContext)

    useEffect(() => {
        const setInitValues = async () => {
            const initColumnHeaders = await window.myAPI.getColumnHeaders()
            columnHeaderFormik.setValues(initColumnHeaders)
        }
        setInitValues()
    }, [])

    const saveColumnHeaders = async (columnHeaders) => {
        if (columnHeaderFormik.errors.length > 0) {
            displayErrorDialog({
                name: "ERROR",
                message: "At least one of the column headers has an issue. Refer to the red error messages above each box for more information."
            })
        }

        try {
            window.myAPI.updateColumnHeaders(columnHeaders)
            setEditMode(false)
        } catch(error) {
            displayErrorDialog(error)
        }
    }

    const columnHeadersSchema = Yup.object({
        "Rank": Yup.string()
            .required("Required")
            .default(""),
        "Name": Yup.string()
            .required("Required")
            .default(""),
        "HP Number": Yup.string()
            .required("Required")
            .default(""),
        "MC Type": Yup.string()
            .required("Required")
            .default(""),
        "MC from a SAF Medical Centre?": Yup.string()
            .required("Required")
            .default(""),
        "MC Start Date": Yup.string()
            .required("Required")
            .default(""),
        "MC End Date": Yup.string()
            .required("Required")
            .default(""),
        "Submitted MC?": Yup.string()
            .required("Required")
            .default("")
    })

    const columnHeaderFormik = useFormik({
        validationSchema: columnHeadersSchema,
        onSubmit: saveColumnHeaders,
        initialValues: columnHeadersSchema.default()
    })

    return (
        <>
            <Header title={"Column Headers"} subtitle={"Tell the program which column header corresponds to which information!"} prevPage={"/settings"} />
            <main className='h-auto flex flex-col gap-7 items-center justify-center m-5'>
                <div className='grid grid-cols-2 m-auto gap-3 w-3/4 items-center'>
                    <p></p>
                    <p className='font-bold'>Column Headers</p>
                    <p className='text-base'>Rank</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"Rank"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("Rank")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>Name</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"Name"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("Name")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>HP Number</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"HP Number"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("HP Number")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>MC Type</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"MC Type"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("MC Type")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>MC from a SAF Medical Centre?</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"MC from a SAF Medical Centre?"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("MC from a SAF Medical Centre?")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>MC Start Date</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"MC Start Date"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("MC Start Date")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>MC End Date</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"MC End Date"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("MC End Date")}
                            disabled={!editMode}
                        />
                    </div>
                    <p className='text-base'>Submitted MC?</p>
                    <div>
                        <FormErrorDisplay formik={columnHeaderFormik} field={"Submitted MC?"} />
                        <input
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...columnHeaderFormik.getFieldProps("Submitted MC?")}
                            disabled={!editMode}
                        />
                    </div>
                </div>
                <button
                    type='submit'
                    onClick={columnHeaderFormik.handleSubmit}
                    className={`${editMode ? "block" : "hidden"} bg-platinum text-xl py-3 px-6 rounded-lg w-fit ${Object.keys(columnHeaderFormik.errors).length > 0 ? "opacity-25 cursor-default" : "hover:bg-slate-100 "}`}
                    disabled={Object.keys(columnHeaderFormik.errors).length > 0}
                >
                    Save
                </button>
                <button
                    type='button'
                    onClick={() => { setEditMode(true) }}
                    className={`${editMode ? "hidden" : "block"} bg-platinum text-xl py-3 px-6 rounded-lg w-fit hover:bg-slate-100`}
                >
                    Edit
                </button>
            </main>
        </>
    );
};

export default ColumnHeaders;