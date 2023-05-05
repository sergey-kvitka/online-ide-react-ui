export default class Constants {

    static IDE_API_HOST = 'http://localhost:';
    static IDE_API_PORT = '8800';
    static IDE_API_CONTEXT_PATH = 'ide/api';

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

    // * Messages
    static WRONG_LOGIN_PASSWORD = 'Неверный логин или пароль';

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
                `Редактор может вносить изменения в код и структуру \n` +
                `проекта, а также оставлять комментарии.`,
            color: 'green'
        },
        'COMMENTER': {
            name: 'комментатор',
            description:
                `Комментатор не может вносить изменения в код и \n` +
                `структуру проекта, но может оставлять комментарии.`,
            color: 'blue'
        },
        'WATCHER': {
            name: 'наблюдатель',
            description:
                `Наблюдатель не может вносить изменения в код и \n` +
                `структуру проекта и не может оставлять \n` +
                `комментарии, но наблюдатель видит все изменения, \n` +
                `вносимые в код проекта и его структуру.`,
            color: 'grey'
        }
    };

    static PERMISSIONS = {
        PROJECT_SETTINGS: 'PROJECT_SETTINGS',
        SET_ADMIN_ROLE: 'SET_ADMIN_ROLE',
        SET_ROLES: 'SET_ROLES',
        ADD_AND_DELETE_USERS: 'ADD_AND_DELETE_USERS',
        EDIT: 'EDIT',
        COMMENT: 'COMMENT',
        BE_PARTICIPANT: 'BE_PARTICIPANT'
    }
}