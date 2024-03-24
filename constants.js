export const COMMAND_NAMES = {
    GREETER: 'greeter',
    START: 'start',
    ECHO: 'echo',
    CREATE: 'create_post',
    ADD_BTN: 'addbutton',
}

export const COMMANDS = [
    {
        command: COMMAND_NAMES.START,
        description: 'Запуск бота',
    },
    // {
    //     command: COMMAND_NAMES.GREETER,
    //     description: 'Greeter scene',
    // },
    // {
    //     command: COMMAND_NAMES.ECHO,
    //     description: 'Echo scene',
    // },
    {
        command: COMMAND_NAMES.CREATE,
        description: 'Create',
    },
    {
        command: COMMAND_NAMES.ADD_BTN,
        description: 'Добавить кнопку',
    },
]

export const SCENE_NAMES = {
    CREATE_START: 'createStart',
    CREATE_DESCRIPTION: 'createDescription',
    CREATE_IMAGE: 'createImage',
    CREATE_PUBLISH: 'createPublish',
    CREATE_BTN: 'createBtn',
    CREATE_CALLBACK_TEXT: 'createBtnCallbackText',
    ADD_BTN_TO_POST: 'addBtnToPost',
}

export const BOT_EVENT_NAMES = {
    create: 'create',
    cancel: 'cancel',
    skip: 'skip',
    addButton: 'addButton',
    next: 'next',
    createPostBtn: 'createPostBtn',
    publication: 'publication',
    reset: 'reset',
    preview: 'preview',
}

export const POST_OBJECT = {
    title: '',
    description: '',
    fileId: '',
    photos: [],
    buttonCaption: '',
    buttonText: '',
    buttons: {},
}
