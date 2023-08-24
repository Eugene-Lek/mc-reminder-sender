
export const FormErrorDisplay = ({formik, field}) => {
    if (!formik.errors[field] || !formik.touched[field]) return

    return (
        <div className="text-red-500 text-xs">{formik.errors[field]}</div>
    )
}