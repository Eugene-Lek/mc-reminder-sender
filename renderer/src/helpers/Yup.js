import * as Yup from "yup";

const VALID_PLACEHOLDERS = ["rank", "name", "mc start", "mc end"].map(str => str.toLowerCase())

Yup.addMethod(Yup.string, "placeholders", function () {
    return (this.test({
        name: "test-placeholders",
        test: (template, context) => {
            const insertedPlaceholders = [...template.matchAll(/\{[^}]+\}/g)]
            for (let i = 0; i < insertedPlaceholders.length; i++) {
                const candidate_placeholder_data = insertedPlaceholders[i]
                const candidate_placeholder = candidate_placeholder_data[0].slice(1, -1) // index 0 corresponds to the actual match detected. The rest is metadata
                if (!VALID_PLACEHOLDERS.includes(candidate_placeholder.toLowerCase())) {
                    return context.createError({message: `{${candidate_placeholder}} is an invalid placeholder. Please refer to the list of valid placeholders at the top.`})
                }
            }
            return true
        }
    }))
})

Yup.addMethod(Yup.string, "curlybraces", function () {
    return (
        this.test({
            name: "test-unpaired { or }",
            test: (template, context) => {
                const num_open_curly = [...template.matchAll(/\{/g)].length
                const num_close_curly = [...template.matchAll(/\}/g)].length

                if (num_open_curly == num_open_curly) return true

                if (num_open_curly > num_close_curly) {
                    return context.createError({message: `One or more unpaired '{' was detected`})
                } else {
                    return context.createError({message:`One or more unpaired '}' was detected`})
                }
            }
        })
    )
})

export default Yup;