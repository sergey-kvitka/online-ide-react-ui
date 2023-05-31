import {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {useLocalState} from "../../util/useLocalStorage";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Container,
    InputAdornment,
    MenuItem,
    Modal,
    Select,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import {Badge, Stack} from "react-bootstrap";
import ProjectUserInfo from "./ProjectUserInfo";
import {Search, Settings} from "@mui/icons-material";
import UserSearch from "../UserSearch";
import ModalCloseIcon from "../ModalCloseIcon";
import ProjectMonitoring from "./ProjectMonitoring";

export default function ProjectInfo({currentProjectInfoSetter, isAuthorizedSetter}) {

    const {project_uuid: projectUUID} = useParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [projectInfo, setProjectInfo] = useState(null);
    const [myInfo, setMyInfo] = useState(null);
    const [projectRole, setProjectRole] = useState(null);

    const [projectUsers, setProjectUsers] = useState(null);
    const [projectUserComponents, setProjectUserComponents] = useState([]);
    const [projectUserFilter, setProjectUserFilter] = useState('');

    const [projectDescription, setProjectDescription] = useState('');

    const [creatorInfo, setCreatorInfo] = useState(null);
    const [projectTypeInfo, setProjectTypeInfo] = useState(null);

    const [initData, setInitData] = useState(false);

    const [usersOpen, setUsersOpen] = useState(false);
    const [userSearchOpen, setUserSearchOpen] = useState(false);

    const [successDeleteUserToast, setSuccessDeleteUserToast] = useState(false);
    const [failDeleteUserToast, setFailDeleteUserToast] = useState(false);
    const [failDeleteUserToastMessage, setFailDeleteUserToastMessage] = useState('');

    const [projectDeleteOpen, setProjectDeleteOpen] = useState(false);

    const [failDeleteProjectToast, setFailDeleteProjectToast] = useState(false);
    const [failDeleteProjectToastMessage, setFailDeleteProjectToastMessage] = useState('');

    const [projectEditOpen, setProjectEditOpen] = useState(false);

    const [successEditProjectToast, setSuccessEditProjectToast] = useState(false);
    const [failEditProjectToast, setFailEditProjectToast] = useState(false);
    const [failEditProjectToastMessage, setFailEditProjectToastMessage] = useState('');

    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const [stopMonitor, setStopMonitor] = useState(false);
    const [hidePage, setHidePage] = useState(false);
    const [monitorMessage, setMonitorMessage] = useState('');

    const navigate = useNavigate();

    function getProjectInfo() {
        fetch(Methods.getIdeApiURL(`project/${projectUUID}/info`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(response);
            })
            .then(projectInfo => {
                setProjectInfo(projectInfo)
                getMyInfo();
                getProjectUsers();
                getProjectRole();
            })
            .catch(error => error.json()
                .then(error => {
                    const message = error['message'];
                    if (['projectDoesNotExist', 'notAParticipant'].includes(message)) {
                        navigate(`/projects?afterAction=${message}`);
                        return;
                    }
                    navigate(`/projects?afterAction=error`);
                }));
    }

    // navigate(`/projects?afterAction=projectDoesNotExist`);

    function getMyInfo() {
        fetch(Methods.getIdeApiURL(`user/info`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(myInfo => {
                setMyInfo(myInfo);
            });
    }

    function getProjectUsers() {
        fetch(Methods.getIdeApiURL(`project/${projectUUID}/projectUsers`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(projectUsers => {
                setProjectUsers(projectUsers);
            });
    }

    function getProjectRole() {
        fetch(Methods.getIdeApiURL(`projectUser/projectRole/${projectUUID}`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(projectRole => {
                setProjectRole(projectRole);
            });
    }

    function editProject() {
        fetch(Methods.getIdeApiURL(`project/${projectUUID}/edit`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'PUT',
            body: JSON.stringify({
                'name': newProjectName,
                'description': newProjectDescription,
                'projectType': newProjectType
            })
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(response);
            })
            .then(() => {
                let newProjectInfo = JSON.parse(JSON.stringify(projectInfo));
                newProjectInfo['name'] = newProjectName;
                newProjectInfo['description'] = newProjectDescription;
                newProjectInfo['projectType'] = newProjectType;
                setProjectInfo(newProjectInfo);
                setProjectEditOpen(false);
                setSuccessEditProjectToast(true);
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        setFailEditProjectToastMessage(error);
                        setFailEditProjectToast(true);
                    });
            });
    }

    function deleteProject() {
        fetch(Methods.getIdeApiURL(`project/${projectUUID}/delete`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET',
        })
            .then(response => {
                return (response.status === 200)
                    ? response.text()
                    : Promise.reject(response);
            })
            .then(() => {
                currentProjectInfoSetter({'page': 'NONE'});
                navigate(`/projects?afterAction=deleteProject`);
            })
            .catch(response => {
                return response.text()
                    .then(error => {
                        setFailDeleteProjectToastMessage(error);
                        setFailDeleteProjectToast(true);
                    });
            });
    }

    const addProjectUser = (projectUser) => {
        setProjectUsers(prev => [...prev, projectUser]);
    };

    const deleteProjectUser = (username, setModalOpen) => {
        console.log('hello');
        fetch(Methods.getIdeApiURL('projectUser/delete'), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'POST',
            body: JSON.stringify({
                'projectUUID': projectUUID,
                'username': username
            })
        }).then(response => {
            console.log(response);
            return (response.status === 200)
                ? response.text()
                : Promise.reject(response);
        })
            .then(() => {
                setProjectUsers(prev => [...prev].filter(pu => (pu['userInfo']['username'] !== username)));
                setModalOpen(false);
                setSuccessDeleteUserToast(true);
            })
            .catch(response => {
                return response.text()
                    .then(error => {
                        setFailDeleteUserToastMessage(error);
                        setFailDeleteUserToast(true);
                    });
            });
    }

    const handleMonitorMessage = (message) => {
        setMonitorMessage(message);
    }

    useEffect(() => {
        isAuthorizedSetter(true);
    }, []);

    useEffect(() => {
        if (!monitorMessage || monitorMessage === '') return;
        if (['projectDoesNotExist', 'notAParticipant'].includes(monitorMessage)) {
            setStopMonitor(true);
            navigate(`/projects?afterAction=${monitorMessage}Anymore`);
            return;
        }
        if (monitorMessage === 'roleChanged') {
            setStopMonitor(true);
            setHidePage(true);
        }
    }, [monitorMessage]);

    useEffect(() => {
        if (!projectUsers || !myInfo || !projectRole) return;
        let searchStr = projectUserFilter.trim().toLowerCase();
        let pUsers = projectUsers.filter(pu => (searchStr === '')
            ? true : pu['userInfo']['username'].toLowerCase().includes(searchStr));
        pUsers.sort((pu1, pu2) => {
            const username1 = pu1['userInfo']['username'];
            const username2 = pu2['userInfo']['username'];

            if (searchStr !== '') {
                let index1 = username1.indexOf(searchStr);
                let index2 = username2.indexOf(searchStr);
                if (index1 !== 0) index1 = 1;
                if (index2 !== 0) index2 = 1;
                if (index1 !== index2) return index1 - index2;
            }

            if (username1 === myInfo['userNames']['username']) return -1;
            if (username2 === myInfo['userNames']['username']) return 1;
            if (pu1['projectRole'] === 'CREATOR') return -1;
            if (pu2['projectRole'] === 'CREATOR') return 1;

            const change2 = pu2['lastChange'];
            const change1 = pu1['lastChange'];
            if (!change2 && change1) return -1;
            if (!change1 && change2) return 1;
            if (change1 !== change2) {
                const date1 = new Date(change1);
                const date2 = new Date(change2);
                if (date1 > date2) return -1;
                if (date1 < date2) return 1;
            }
            return (username1 < username2) ? -1 : (username1 > username2 ? 1 : 0);
        });
        setProjectUserComponents(pUsers.map(projectUser =>
            <ProjectUserInfo
                className={'border-1'}
                key={projectUser['projectUserId']}
                projectUserInfo={projectUser}
                myInfo={myInfo}
                myProjectRole={projectRole}
                deleteProjectUser={deleteProjectUser}
            />
        ));
    }, [projectUsers, myInfo, projectRole, projectUserFilter]);

    useEffect(() => {
        if (!projectInfo) {
            currentProjectInfoSetter({'page': 'LOADING'});
            return;
        }
        currentProjectInfoSetter({
            'projectName': projectInfo['name'],
            'projectUUID': projectUUID,
            'page': 'PROJECT_INFO'
        });
    }, [projectInfo, projectUUID]);

    useEffect(() => {
        async function init() {
            getProjectInfo();
        }

        init().then();
    }, []);

    useEffect(() => {
        if (!projectInfo) return;
        setCreatorInfo(projectInfo['creatorInfo']);
        setProjectTypeInfo(Constants.PROJECT_TYPE_INFO[projectInfo['projectType']]);
        setProjectDescription(projectInfo['description']);

        setNewProjectName(projectInfo['name']);
        setNewProjectType(projectInfo['projectType']);
        setNewProjectDescription(projectInfo['description']);
    }, [projectInfo]);

    const initDataDeps = [projectInfo, myInfo, projectUsers, projectRole, creatorInfo, projectTypeInfo];
    useEffect(() => {
        setInitData(initDataDeps.reduce((a, b) => a && b, true));
    }, initDataDeps);

    // noinspection JSValidateTypes
    return hidePage ? (
        /* if (monitorMessage === 'roleChanged') */
        <Snackbar // ? ROLE CHANGED
            open={hidePage}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            sx={{marginTop: '8vh'}}
        >
            <Alert
                severity={'warning'}
                variant={"outlined"}
                sx={{width: '100%'}}
                className={'d-flex flex-row align-items-center'}
            >
                <div className={'d-flex flex-column align-items-center'}>
                    <Typography variant={'h6'} textAlign={'center'} style={{margin: '20px 10px'}}>
                        Ваша роль в данном проекте была изменена создателем или<br/>
                        администратором проекта. Во избежание ошибок и для <br/>
                        актуализации данных проекта необходимо обновить страницу.
                    </Typography>
                    <Button
                        sx={{mb: 1}}
                        color={"warning"}
                        variant={"contained"}
                        onClick={() => {
                            window.location.reload();
                        }}
                    >Обновить страницу</Button>
                </div>
            </Alert>
        </Snackbar>
    ) : (!initData ? <></> : (
        <Container>
            {(projectUUID && projectRole && jwt) ?
                <ProjectMonitoring
                    projectUUID={projectUUID}
                    jwt={jwt}
                    currentProjectRole={projectRole['projectRole']}
                    messageHandler={handleMonitorMessage}
                    stop={stopMonitor}
                /> : <></>}

            <div className={'proj-info'}>
                <br/><h5>Проект</h5>
                <div className={'d-flex flex-row proj-title align-items-center'}>
                    <Typography
                        variant={'h3'}
                    >
                        {projectInfo['name']}
                    </Typography>
                    {([...projectRole['permissions']].includes('PROJECT_SETTINGS'))
                        ? <Button
                            variant={"contained"}
                            className={'bg-primary edit-proj'}
                            style={{marginLeft: 30, height: "min-content", padding: '15px 0'}}
                            onClick={() => setProjectEditOpen(true)}
                            title={'Открыть настройки проекта'}
                        ><Settings/></Button>
                        : <></>}
                </div>

                <br/>
                <Typography
                    variant={'h4'}
                >
                    Проект пользователя <span
                    title={`${
                        creatorInfo['firstName']
                    } ${
                        creatorInfo['lastName']
                    }`}
                    style={{cursor: 'pointer'}}
                >{creatorInfo['username']}</span>
                </Typography>
                <Typography variant={'h5'} style={{margin: '20px 0'}}>
                    Проект создан {Methods.fullDateTime(new Date(projectInfo['created']))}
                </Typography>
                <Typography variant={'h5'}>
                    <span>Тип проекта: </span>
                    <Badge
                        title={projectTypeInfo.description}
                        className={`custom-badge mt-1 badge-${projectTypeInfo.color}`}
                    >
                        {projectTypeInfo.name.toUpperCase()}
                    </Badge>
                </Typography>
                {projectInfo['projectBuildType']}
                <Typography variant={'h5'} style={{margin: '10px 0 10px'}}>Описание проекта:</Typography>
                {projectDescription === ''
                    ? <span style={{margin: '0 15px', fontSize: 20}} className={'opacity-75'}><i>Нет описания</i></span>
                    : <Box
                        className={'border border-dark border-opacity-25 proj-desc-box'}
                        style={{whiteSpace: 'pre-line', borderRadius: 10}}
                    >{projectDescription}</Box>}

                <Typography
                    variant={'h6'}
                    style={{margin: '10px 5px 20px'}}
                >
                    Количество файлов в проекте: {projectInfo['projectFilesAmount']}
                </Typography>
            </div>

            <Accordion className={'border border-opacity-25 border-dark users-accordion'}
                       style={{borderRadius: 10, padding: '0 10px'}}
                       expanded={usersOpen}
                       onChange={() => setUsersOpen(!usersOpen)}>
                <div
                    className={'d-flex flex-row justify-content-between align-items-center  '}
                    style={{margin: 10}}
                >
                    <AccordionSummary className={'no-margin'} component={"h4"}
                    >Участники проекта ({projectUsers.length})</AccordionSummary>
                    <TextField
                        placeholder={'Поиск участников'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search/>
                                </InputAdornment>
                            ),
                        }}
                        value={projectUserFilter}
                        onChange={event => setProjectUserFilter(event.target.value)}
                    />
                    {([...projectRole['permissions']].includes('ADD_AND_DELETE_USERS')
                        || ['PUBLIC_WATCH', 'PUBLIC_EDIT'].includes(projectInfo['projectType'])) ?
                        <>
                            <Button
                                onClick={() => setUserSearchOpen(true)}
                                variant={'contained'}
                                size={"large"}
                            >Добавить участников</Button>
                            <Modal
                                open={userSearchOpen}
                                onClose={() => setUserSearchOpen(false)}
                            >
                                <UserSearch
                                    projectUsers={projectUsers}
                                    addProjectUser={addProjectUser}
                                    myProjectRole={projectRole}
                                    myInfo={myInfo}
                                    projectType={projectInfo['projectType']}
                                    closeFunction={() => setUserSearchOpen(false)}
                                />
                            </Modal>
                        </> : <></>}
                </div>

                {projectUserFilter.trim().length === 0 ? <></> : <p style={{
                    fontSize: 18,
                    margin: '-5px 40px 10px'
                }}><i>Найдено участников по запросу: <b>{projectUserComponents.length}</b></i></p>}

                <AccordionDetails style={{marginTop: -7}}>
                    <Stack direction={'vertical'} gap={3}>
                        {projectUserComponents}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {projectRole['projectRole'] === 'CREATOR' ?
                <div className={'d-flex align-items-center'}>
                    <Button
                        variant={"text"}
                        color={"error"}
                        style={{
                            fontSize: 28,
                            width: 400,
                            margin: '20px auto 20px',
                            alignSelf: "center",
                            textDecoration: 'underline',
                            textTransform: 'none'
                        }}
                        onClick={() => setProjectDeleteOpen(true)}
                    >Удалить проект</Button>
                </div>
                : <></>}

            <Modal
                open={projectEditOpen}
                onClose={() => setProjectEditOpen(false)}
            >
                <div className={'modal-center'}>
                    <ModalCloseIcon closeFunction={() => setProjectEditOpen(false)}/>
                    <div
                        className={'bg-white d-flex flex-column gap-4 align-items-center'}
                        style={{width: 800, padding: '30px 40px'}}
                    >
                        <h1>Настройки проекта</h1>
                        <h4 style={{marginBottom: -12, marginTop: -10}}>Тип проекта</h4>
                        <Select
                            value={newProjectType}
                            onChange={event => setNewProjectType(event.target.value)}
                        >{
                            Object.keys(Constants.PROJECT_TYPE_INFO).map(projectType => {
                                const currentProjectType = Constants.PROJECT_TYPE_INFO[projectType];
                                return <MenuItem
                                    value={projectType}
                                    key={projectType}
                                >
                                    <Badge className={`custom-badge badge-${currentProjectType.color}`}>
                                        {currentProjectType.name.toUpperCase()}
                                    </Badge>
                                </MenuItem>
                            })
                        }</Select>
                        <div style={{width: '80%', margin: '0 auto'}}>
                            <TextField
                                label={'Название проекта'}
                                className={'new-project-name-input'}
                                fullWidth
                                value={newProjectName}
                                onChange={event => setNewProjectName(event.target.value)}
                            />
                        </div>
                        <TextField
                            key={'description'}
                            type={"text"}
                            label={'Описание проекта'}
                            value={newProjectDescription}
                            multiline={true}
                            maxRows={12}
                            minRows={2}
                            fullWidth={true}
                            onChange={event => setNewProjectDescription(event.target.value)}
                        />
                        <Button
                            variant={'contained'}
                            style={{fontSize: 24, textTransform: "none"}}
                            onClick={() => editProject()}
                        >Сохранить настройки</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={projectDeleteOpen}
                onClose={() => setProjectDeleteOpen(false)}
            >
                <div className={'modal-center'}>
                    <ModalCloseIcon closeFunction={() => setProjectDeleteOpen(false)}/>
                    <div
                        className={'bg-white d-flex flex-column gap-4 align-items-center p-4'}
                    >
                        <Typography variant={"h4"} textAlign={"center"}>Вы действительно хотите удалить данный проект
                            (<b>{projectInfo['name']}</b>) и все его файлы? Отменить действие будет невозможно!
                        </Typography>
                        <div
                            className={'d-flex flex-row justify-content-center gap-5 mt-1'}
                            style={{marginBottom: 10}}
                        >
                            <Button
                                variant={'contained'}
                                color={"info"}
                                size={'large'}
                                onClick={() => setProjectDeleteOpen(false)}
                            >
                                Отменить удаление
                            </Button>
                            <Button
                                variant={'contained'}
                                color={"error"}
                                size={'large'}
                                onClick={() => {
                                    deleteProject();
                                }}
                            >
                                Удалить
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Snackbar // ? FAIL DELETE PROJECT
                open={failDeleteProjectToast}
                autoHideDuration={10000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setFailDeleteProjectToast(false);
                }}
            >
                <Alert
                    severity={'error'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setFailDeleteProjectToast(false);
                    }}
                >{failDeleteProjectToastMessage}</Alert>
            </Snackbar>

            <Snackbar // ? SUCCESS DELETE USER
                open={successDeleteUserToast}
                autoHideDuration={6000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setSuccessDeleteUserToast(false);
                }}
            >
                <Alert
                    severity={'success'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setSuccessDeleteUserToast(false);
                    }}
                >Участник проекта успешно удалён!</Alert>
            </Snackbar>

            <Snackbar // ? FAIL DELETE USER
                open={failDeleteUserToast}
                autoHideDuration={10000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setFailDeleteUserToast(false);
                }}
            >
                <Alert
                    severity={'error'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setFailDeleteUserToast(false);
                    }}
                >{failDeleteUserToastMessage}</Alert>
            </Snackbar>

            <Snackbar // ? SUCCESS EDIT PROJECT
                open={successEditProjectToast}
                autoHideDuration={6000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setSuccessEditProjectToast(false);
                }}
            >
                <Alert
                    severity={'success'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setSuccessEditProjectToast(false);
                    }}
                >Изменения проекта сохранены!</Alert>
            </Snackbar>

            <Snackbar // ? FAIL EDIT PROJECT
                open={failEditProjectToast}
                autoHideDuration={10000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setFailEditProjectToast(false);
                }}
            >
                <Alert
                    severity={'error'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setFailEditProjectToast(false);
                    }}
                >{failEditProjectToastMessage}</Alert>
            </Snackbar>
        </Container>
    ));
};
