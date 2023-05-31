export default class Constants {

    static IDE_API_HOST = 'http://localhost:';
    static IDE_API_PORT = '8800';
    static IDE_API_CONTEXT_PATH = 'ide/api';

    static EXEC_API_HOST = 'http://localhost:';
    static EXEC_API_PORT = '8123';
    static EXEC_API_CONTEXT_PATH = 'jar-exec/api';

    // * auth endpoints
    static IDE_API_LOGIN = 'auth/login';
    static IDE_API_REGISTER = 'auth/register';
    static IDE_API_VALIDATE_JWT = 'auth/validate';
    // * project endpoints
    static IDE_API_GET_PROJECTS = 'project/yourProjects';

    static BEARER_PREFIX = 'Bearer_';

    static JWT_LS_KEY = 'jwt-ide-ls';

    // * Roles
    static ROLE_USER = 'ROLE_USER';
    static ROLE_ADMIN = 'ROLE_ADMIN';

    // * Project types info
    static PROJECT_TYPE_INFO = {
        'PUBLIC_EDIT': {
            name: 'открытый',
            description:
                `Проект доступен всем пользователям, все пользователи \n` +
                `могут вносить изменения в код и структуру проекта. \n` +
                `Доступ можно получить по ссылке.`,
            color: 'green',
            defaultProjectRole: 'EDITOR'
        },
        'PUBLIC_WATCH': {
            name: 'публичный',
            description:
                `Проект доступен всем пользователям, все пользователи \n` +
                `могут просматривать код и видеть все изменения проекта, \n` +
                `но не могут вносить никаких изменений. Доступ можно \n` +
                `получить по ссылке.`,
            color: 'blue',
            defaultProjectRole: 'WATCHER'
        },
        'PRIVATE': {
            name: 'приватный',
            description:
                `Доступ к проекту нельзя получить даже по ссылке, но \n` +
                `создатель проекта может пригласить пользователей, дав \n` +
                `им доступ к проекту и назначив им определённую роль. \n` +
                `После приглашения пользователи сразу получают доступ к \n` +
                `проекту и могут войти в него из меню выбора проекта.`,
            color: 'yellow'
        }
    };

    // * Project roles info
    static PROJECT_ROLE_INFO = {
        'CREATOR': {
            name: 'создатель',
            description:
                `Создатель — пользователь, создавший проект. Он же \n` +
                `является владельцем проекта и имеет наибольшее количество \n` +
                `полномочий.`,
            color: 'red'
        },
        'PROJECT_ADMIN': {
            name: 'администратор',
            description:
                `Администратор является вторым по количеству полномочий \n` +
                `участником проекта после создателя. Администратор может \n` +
                `вносить любые изменения в код и структуру проекта, а \n` +
                `также назначать пользователям любые роли (кроме ролей \n` +
                `"Администратор" и "Создатель").`,
            color: 'purple'
        },
        'EDITOR': {
            name: 'редактор',
            description:
            // `Редактор может вносить изменения в код и структуру \n` +
            // `проекта, а также оставлять комментарии.`,
                `Редактор может вносить изменения \n` +
                `в код и структуру проекта`,
            color: 'green'
        },
        // 'COMMENTER': {
        //     name: 'комментатор',
        //     description:
        //         `Комментатор не может вносить изменения в код и \n` +
        //         `структуру проекта, но может оставлять комментарии.`,
        //     color: 'blue'
        // },
        'WATCHER': {
            name: 'наблюдатель',
            description:
                `Наблюдатель не может вносить изменения в код и \n` +
                // `структуру проекта и не может оставлять \n` +
                // `комментарии, но наблюдатель видит все изменения, \n` +
                `структуру проекта, но наблюдатель видит все изменения, \n` +
                `вносимые в код проекта и его структуру.`,
            color: 'blue'
        }
    };

    static BUILD_TYPE_INFO = {
        'DEFAULT': {
            key: 'DEFAULT',
            name: 'стандартный',
            description:
                `Стандартный Java-проект`,
            color: 'grey'
        },
        'MAVEN': {
            key: 'MAVEN',
            name: 'maven',
            description:
                `Проект на основе фреймворка Maven`,
            color: 'maven'
        }
    }

    static PERMISSIONS = {
        PROJECT_SETTINGS: 'PROJECT_SETTINGS',
        SET_ADMIN_ROLE: 'SET_ADMIN_ROLE',
        SET_ROLES: 'SET_ROLES',
        ADD_AND_DELETE_USERS: 'ADD_AND_DELETE_USERS',
        EDIT: 'EDIT',
        COMMENT: 'COMMENT',
        BE_PARTICIPANT: 'BE_PARTICIPANT'
    };

    static PROJECT_RUN_STATUS_INFO = {
        INIT: {
            name: 'Инициализация',
            type: 'init'
        },
        MAVEN_TEMPLATE_CREATING: {
            name: 'Создание шаблона\nMaven-проекта',
            type: 'init'
        },
        MAVEN_TEMPLATE_CREATING_FAILED: {
            name: 'Ошибка создания\nшаблона Maven-проекта',
            type: 'error'
        },
        MAVEN_TEMPLATE_CREATED: {
            name: 'Шаблон Maven-проекта\nсоздан',
            type: 'loading'
        },
        PROJECT_FILES_CREATING: {
            name: 'Загрузка файлов\nпроекта',
            type: 'loading'
        },
        PROJECT_FILES_CREATING_FAILED: {
            name: 'Ошибка загрузки\nфайлов проекта',
            type: 'error'
        },
        PROJECT_FILES_CREATED: {
            name: 'Файлы проектов\nсозданы',
            type: 'loading'
        },
        MAVEN_JAR_CREATING: {
            name: 'Сбор JAR-файла\nчерез Maven',
            type: 'loading'
        },
        MAVEN_JAR_CREATING_FAILED: {
            name: 'Ошибка сбора JAR-файла\nчерез Maven',
            type: 'error'
        },
        MAVEN_JAR_CREATED: {
            name: 'JAR-файл собран\nчерез Maven',
            type: 'loading'
        },
        DOCKER_FILES_CREATING: {
            name: 'Создание\nDockerfile',
            type: 'loading'
        },
        DOCKER_DEPLOYING: {
            name: 'Развёртывание проекта\nв Docker',
            type: 'loading'
        },
        DOCKER_DEPLOYING_FAILED: {
            name: 'Ошибка развёртывания\nпроекта в Docker',
            type: 'error'
        },
        DOCKER_RUNNING: {
            name: 'Приложение запущено\nв Docker',
            type: 'running'
        },

        USER_INTERRUPT: {
            name: 'Остановка процесса\nпользователем',
            type: 'finish'
        },
        PROGRAM_FINISHED: {
            name: 'Работа приложения\nзавершена',
            type: 'finish'
        }
    }

    static JAVA_PRIMITIVES = ['boolean', 'char', 'byte', 'short', 'int', 'long', 'double', 'float']
    static JAVA_KEYWORDS = [...Constants.JAVA_PRIMITIVES];
}