const Store = require('electron-store');

const DEFAULT_MESSAGE_TEMPLATES = {
    HL: "Hi {rank} {name}, I am CPL Eugene from 30SCE's S1 department. Please kindly *send me a picture/softcopy* of your hospitalisation leave *({mc start} to {mc end})* so that way I can have it filed for you.\n \nThanks!",
    MC: "Hi {rank} {name}, I am CPL Eugene from 30SCE's S1 department. Have you submitted your MC *({mc start} to {mc end})* via NS Portal/ESS? Once done, *please send me a screenshot of the submission receipt*.\n \nThanks!"
}

export const getMessageTemplates = () => {
    const store = new Store()

    if (!store.get("Message Templates")) store.set("Message Templates", DEFAULT_MESSAGE_TEMPLATES)
    const initTemplates = store.get("Message Templates")     
    return initTemplates
}

export const updateMessageTemplates = (event, messageTemplates) => {
    const store = new Store()
    store.set("Message Templates", messageTemplates)
}