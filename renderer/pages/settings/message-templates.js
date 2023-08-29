import { Header } from '../../src/components/Header';
import { dialogSettingsContext } from "../../src/helpers/dialogContext"

import { useState, useContext, useEffect } from 'react';
import { useFormik } from "formik";
import Yup from "../../src/helpers/Yup"
import { FormErrorDisplay } from '../../src/components/FormErrorDisplay';

function MessageTemplates() {
    const [editMode, setEditMode] = useState(true)
    const { setDialogSettings, closeDialog, displayErrorDialog } = useContext(dialogSettingsContext)

    useEffect(() => {
        const setInitValues = async () => {
            const initMessageTemplates = await window.myAPI.getMessageTemplates()
            templateFormik.setValues(initMessageTemplates)
        }
        setInitValues()
    }, [])

    const saveTemplates = async ({
        MC,
        HL
    }) => {
        if (templateFormik.errors.length > 0) {
            displayErrorDialog({
                name: "ERROR",
                message: "At least one of the templates has an issue. Refer to the red error messages above each box for more information."
            })
        }

        try {
            await window.myAPI.updateMessageTemplates({ MC, HL })
            setEditMode(false)
        } catch(error) {
            displayErrorDialog(error)
        }
    }

    const templateSchema = Yup.object({
        "MC": Yup.string()
            .required("Required")
            .placeholders()
            .curlybraces()
            .default(""),
        "HL": Yup.string()
            .required("Required")
            .placeholders()
            .curlybraces()
            .default("")           
    })

    const templateFormik = useFormik({
        validationSchema: templateSchema,
        onSubmit: saveTemplates,
        initialValues: templateSchema.default()
    })

    return (
        <>
            <Header title={"Message Templates"} subtitle={"Edit the message templates!"} prevPage={"/settings"} />
            <main className='h-auto flex flex-col gap-5 items-center justify-center my-5'>
                <div className='text-center text-sm max-w-md'><span className='font-bold'>Tip:</span>{" Insert {rank}, {name}, {mc start}, and {mc end} to represent a person's Rank, Name, MC Start Date and MC End Date"}</div>
                <div className='flex flex-col gap-3 m-auto w-3/4'>
                    <div>
                        <p className='text-base'>MC template</p>
                        <FormErrorDisplay formik={templateFormik} field={"MC"} />
                        <textarea
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full h-24 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...templateFormik.getFieldProps("MC")}
                            disabled={!editMode}
                        />
                    </div>
                    <div>
                        <p className='text-base'>HL template</p>
                        <FormErrorDisplay formik={templateFormik} field={"HL"} />
                        <textarea
                            className={`${editMode ? "" : "opacity-50"} p-2.5 w-full h-24 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                            {...templateFormik.getFieldProps("HL")}
                            disabled={!editMode}
                        />
                    </div>
                </div>
                <button
                    type='submit'
                    onClick={templateFormik.handleSubmit}
                    className={`${editMode ? "block" : "hidden"} bg-platinum text-xl py-3 px-6 rounded-lg w-fit ${Object.keys(templateFormik.errors).length > 0 ? "opacity-25 cursor-default" : "hover:bg-slate-100 "}`}
                    disabled={Object.keys(templateFormik.errors).length > 0}
                >
                    Save
                </button>
                <button
                    type='button'
                    onClick={() => {setEditMode(true)}}
                    className={`${editMode ? "hidden" : "block"} bg-platinum text-xl py-3 px-6 rounded-lg w-fit hover:bg-slate-100`}
                >
                    Edit
                </button>                            
            </main>
        </>
    );
};

export default MessageTemplates;