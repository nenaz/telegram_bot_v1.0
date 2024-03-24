import { createStore } from 'zustand/vanilla'

const store = createStore((set) => ({
    title: '',
    description: '',
    fileId: '',
    photos: [],
    buttonCaption: '',
    buttonText: '',
    buttons: {
        // rywiiiw1: {
        //     button: Markup.button.callback('ctx.message.text1', 'rywiiiw1'),
        //     callbackText: 'Text 1',
        // },
        // rywiiiw2: {
        //     button: Markup.button.callback('ctx.message.text2', 'rywiiiw2'),
        //     callbackText: 'Text 2',
        // },
    },
    currentUUID: '',
}))

export default store