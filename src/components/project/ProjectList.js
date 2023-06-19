// noinspection JSCheckFunctionSignatures

import {useEffect, useState} from 'react';
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {useLocalState} from "../../util/useLocalStorage";
import ProjectListItem from "./ProjectListItem";
import {Badge, Stack} from "react-bootstrap";
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Container,
    IconButton,
    InputAdornment,
    MenuItem,
    Modal,
    Select,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import {AddCircle, Clear, Search} from "@mui/icons-material";
import ModalCloseIcon from "../ModalCloseIcon";
import {useSearchParams} from "react-router-dom";

export default function ProjectList({isAuthorizedSetter, currentProjectInfoSetter}) {

    const [searchParams, setSearchParams] = useSearchParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);
    const [myInfo, setMyInfo] = useState(null);
    const [projectList, setProjectList] = useState([]);

    const [onlyMyProjects, setOnlyMyProjects] = useState(false);
    const [projectSearch, setProjectSearch] = useState('');

    const [listElements, setListElements] = useState([]);

    const [openProjectCreation, setOpenProjectCreation] = useState(false);

    const [newProjectName, setNewProjectName] = useState('untitled');
    const [newProjectType, setNewProjectType] = useState(Object.keys(Constants.PROJECT_TYPE_INFO)[0]);
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectBuildType, setNewProjectBuildType] = useState(Constants.BUILD_TYPE_INFO.DEFAULT.key);
    const [newProjectGroupId, setNewProjectGroupId] = useState('com.example');

    const [successCreateProjectToast, setSuccessCreateProjectToast] = useState(false);
    const [failCreateProjectToast, setFailCreateProjectToast] = useState(false);
    const [failCreateProjectToastMessage, setFailCreateProjectToastMessage] = useState('');

    const [successDeleteProjectToast, setSuccessDeleteProjectToast] = useState(false);
    const [registrationToast, setRegistrationToast] = useState(false);
    const [projectDoesNotExistAlert, setProjectDoesNotExistAlert] = useState(false);
    const [projectDoesNotExistAnymoreAlert, setProjectDoesNotExistAnymoreAlert] = useState(false);
    const [notAParticipantAlert, setNotAParticipantAlert] = useState(false);
    const [notAParticipantAnymoreAlert, setNotAParticipantAnymoreAlert] = useState(false);

    function getMyInfo() {
        fetch(Methods.getIdeApiURL('user/info'), {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization': jwt}
        })
            .then(response => response.json())
            .then(info => setMyInfo(info));
    }

    function getProjectList(createdBefore = false) {
        fetch(Methods.getIdeApiURL(Constants.IDE_API_GET_PROJECTS), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(projects => {
                setProjectList(projects);
                if (createdBefore) {
                    setOpenProjectCreation(false);
                    setSuccessCreateProjectToast(true);
                    setNewProjectName('untitled');
                    setNewProjectDescription('');
                }
            });
    }

    function createProject() {
        fetch(Methods.getIdeApiURL(`project/create`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'POST',
            body: JSON.stringify({
                'name': newProjectName,
                'description': newProjectDescription,
                'projectType': newProjectType,
                'groupId': newProjectGroupId,
                'projectBuildType': newProjectBuildType
            })
        }).then(response => {
            console.log(response);
            return (response.status === 200)
                ? response.text()
                : Promise.reject(response);
        })
            .then(() => {
                getProjectList(true);
            })
            .catch(response => {
                return response.text()
                    .then(error => {
                        setFailCreateProjectToastMessage(error);
                        setFailCreateProjectToast(true);
                    });
            });
    }

    useEffect(() => {
        isAuthorizedSetter(true);
    }, []);

    useEffect(() => {
        let result = {'page': 'NONE'};
        if (!(!myInfo)) result = {...result, 'user': myInfo};
        currentProjectInfoSetter(result);
    }, [myInfo]);

    useEffect(() => {
        if (!searchParams) return;
        const afterAction = searchParams.get('afterAction');
        if (!afterAction) return;
        console.log('afterAction=' + afterAction);
        const actionHandlers = { // ?afterAction=
            'deleteProject': () => {
                setSuccessDeleteProjectToast(true);
            },
            'projectDoesNotExistAnymore': () => {
                setProjectDoesNotExistAnymoreAlert(true);
            },
            'projectDoesNotExist': () => {
                setProjectDoesNotExistAlert(true);
            },
            'notAParticipantAnymore': () => {
                setNotAParticipantAnymoreAlert(true);
            },
            'notAParticipant': () => {
                setNotAParticipantAlert(true);
            },
            'registration': () => {
                setRegistrationToast(true);
            },
            'error': () => {
            }
        };
        const handler = actionHandlers[afterAction];
        if (handler) handler();
        searchParams.delete('afterAction');
        setSearchParams(searchParams);
    }, [searchParams]);

    useEffect(() => {
        getProjectList();
        getMyInfo();
    }, []);

    useEffect(() => {
        let i = 0;
        const listElements = (
            projectList
                .filter(project => (!onlyMyProjects || (onlyMyProjects && project['projectRole'] === 'CREATOR')) &&
                    (projectSearch.trim() === ''
                        || (project['name'].toLowerCase().includes(projectSearch.trim().toLowerCase()))))
                .sort((proj1, proj2) => {
                    return new Date(proj2['lastChange']) - new Date(proj1['lastChange'])
                })
        ).map(projectInfo =>
            <ProjectListItem className={'border'} key={i++} projectInfo={projectInfo}
                             projectLeaveHandler={projectLeaveHandler}/>);
        setListElements(listElements);
    }, [projectList, onlyMyProjects, projectSearch]);

    const projectLeaveHandler = (projectUUID) => {
        setProjectList(prev => prev.filter(project => project['projectUUID'] !== projectUUID));
    }

    // noinspection JSValidateTypes
    return <>
        <Container className={'proj-list-cont d-flex flex-column align-items-center'}>
            <Button
                disableElevation={true}
                variant={"contained"}
                className={'create-proj-button'}
                onClick={() => setOpenProjectCreation(true)}
            >
                <AddCircle fontSize={'large'}/>
                <p>Создать проект</p>
            </Button>
            <div className={'d-flex w-65 flex-row justify-content-around align-items-center'}
                 style={{marginTop: -10, marginBottom: 20}}>
                <TextField
                    placeholder={'Поиск проектов'}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search/>
                            </InputAdornment>
                        ),
                    }}
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                />
                <div className={'d-flex flex-row align-items-center'}>
                    <Checkbox checked={onlyMyProjects} onChange={e => setOnlyMyProjects(e.target.checked)}/>
                    <Typography style={{marginLeft: 7}} variant={'h5'}>Только мои проекты</Typography>
                </div>
            </div>
            <Stack direction={'vertical'} gap={4} style={{marginBottom: 25}}>
                {listElements}
            </Stack>
        </Container>
        <Modal
            open={openProjectCreation}
            onClose={() => setOpenProjectCreation(false)}
        >
            <div className={'modal-center'}>
                <ModalCloseIcon closeFunction={() => setOpenProjectCreation(false)}/>
                <div className={'bg-white p-5 d-flex flex-column align-items-center gap-4'}>
                    <h1 style={{textAlign: "center"}}>Создание проекта</h1>
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

                    <h4 style={{marginBottom: -12, marginTop: -10}}>Способ сборки проекта</h4>

                    <Stack direction={"vertical"} style={{width: '100%', marginBottom: 10}} gap={2}>
                        {
                            Object.keys(Constants.BUILD_TYPE_INFO).map(buildType => {
                                return <Card
                                    className={'create-project-build-type'}
                                    elevation={4}
                                    key={buildType}
                                    style={{
                                        width: '90%',
                                        padding: 20,
                                        margin: '0 auto',
                                        cursor: "pointer",
                                        border: ((buildType === newProjectBuildType)
                                            ? '2px solid #5555ff'
                                            : '2px solid rgba(0,0,0,0)'),
                                        borderRadius: 20,
                                        userSelect: "none"
                                    }}
                                    onClick={() => setNewProjectBuildType(buildType)}
                                >
                                    {Methods.capitalize(Constants.BUILD_TYPE_INFO[buildType].name)}
                                </Card>
                            })
                        }
                    </Stack>

                    <div style={{width: '80%', margin: '0 auto'}}>
                        <TextField
                            label={'Название проекта'}
                            className={'new-project-name-input'}
                            fullWidth
                            value={newProjectName}
                            onChange={event => setNewProjectName(event.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <IconButton
                                        style={{opacity: (newProjectName === '' ? 0.5 : 1)}}
                                        disabled={newProjectName === ''}
                                        title={'Очистить'}
                                        onClick={() => setNewProjectName('')}
                                    >
                                        <Clear/>
                                    </IconButton>
                                </InputAdornment>
                            }}
                        />
                    </div>
                    <TextField
                        label={'Описание проекта'}
                        multiline fullWidth
                        key={'description'}
                        type={"text"}
                        minRows={2} maxRows={12}
                        value={newProjectDescription}
                        onChange={event => setNewProjectDescription(event.target.value)}
                    />

                    {(newProjectBuildType === Constants.BUILD_TYPE_INFO.MAVEN.key)
                        ? <>
                            <TextField
                                label={'groupId'}
                                fullWidth
                                value={newProjectGroupId}
                                onChange={event => setNewProjectGroupId(event.target.value)}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        <IconButton
                                            style={{opacity: (newProjectGroupId === '' ? 0.5 : 1)}}
                                            disabled={newProjectGroupId === ''}
                                            title={'Очистить'}
                                            onClick={() => setNewProjectGroupId('')}
                                        >
                                            <Clear/>
                                        </IconButton>
                                    </InputAdornment>
                                }}
                            />
                        </> : <></>}

                    <Button
                        variant={'contained'}
                        style={{fontSize: 24, textTransform: "none"}}
                        onClick={() => createProject()}
                    >Создать проект</Button>
                </div>
            </div>
        </Modal>

        <Snackbar // ? SUCCESS REGISTRATION
            open={registrationToast}
            autoHideDuration={10000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setRegistrationToast(false);
            }}
        >
            <Alert
                severity={'success'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setRegistrationToast(false);
                }}
            >Вы успешно зарегистрировались!</Alert>
        </Snackbar>

        <Snackbar // ? SUCCESS DELETE PROJECT
            open={successDeleteProjectToast}
            autoHideDuration={6000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setSuccessDeleteProjectToast(false);
            }}
        >
            <Alert
                severity={'success'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setSuccessDeleteProjectToast(false);
                }}
            >Проект был удалён!</Alert>
        </Snackbar>

        <Snackbar // ? SUCCESS EDIT PROJECT
            open={successCreateProjectToast}
            autoHideDuration={6000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setSuccessCreateProjectToast(false);
            }}
        >
            <Alert
                severity={'success'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setSuccessCreateProjectToast(false);
                }}
            >Проект успешно создан!</Alert>
        </Snackbar>

        <Snackbar // ? FAIL EDIT PROJECT
            open={failCreateProjectToast}
            autoHideDuration={10000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setFailCreateProjectToast(false);
            }}
        >
            <Alert
                severity={'error'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setFailCreateProjectToast(false);
                }}
            >{failCreateProjectToastMessage}</Alert>
        </Snackbar>

        <Snackbar // ? PROJECT DOES NOT EXIST ANYMORE
            open={projectDoesNotExistAnymoreAlert}
            autoHideDuration={30000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setProjectDoesNotExistAnymoreAlert(false);
            }}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert
                variant={"filled"}
                severity={'error'}
                className={'d-flex flex-row align-items-center'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setProjectDoesNotExistAnymoreAlert(false);
                }}
            >
                <br/>
                <Typography variant={'h6'}>Проект был удалён владельцем</Typography>
                <br/>
            </Alert>
        </Snackbar>

        <Snackbar // ? NOT A PARTICIPANT ANYMORE
            open={notAParticipantAnymoreAlert}
            autoHideDuration={30000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setNotAParticipantAnymoreAlert(false);
            }}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert
                variant={"filled"}
                severity={'error'}
                className={'d-flex flex-row align-items-center'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setNotAParticipantAnymoreAlert(false);
                }}
            >
                <br/>
                <Typography variant={'h6'}>Вы были удалены из списка участников проекта</Typography>
                <br/>
            </Alert>
        </Snackbar>

        <Snackbar // ? PROJECT DOES NOT EXIST
            open={projectDoesNotExistAlert}
            autoHideDuration={30000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setProjectDoesNotExistAlert(false);
            }}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert
                severity={'warning'}
                className={'d-flex flex-row align-items-center'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setProjectDoesNotExistAlert(false);
                }}
            >
                <br/>
                <Typography textAlign={'center'} variant={'h6'}>Проект по такой ссылке не найден. Возможно, он был
                    <br/>удалён создателем, или ссылка на проект некорректна.</Typography>
                <br/>
            </Alert>
        </Snackbar>

        <Snackbar // ? NOT A PARTICIPANT
            open={notAParticipantAlert}
            autoHideDuration={30000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setNotAParticipantAlert(false);
            }}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert
                severity={'error'}
                className={'d-flex flex-row align-items-center'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setNotAParticipantAlert(false);
                }}
            >
                <br/>
                <Typography textAlign={'center'} variant={'h6'}>Вы не являетесь участником данного проекта.<br/>
                    Если вы имели доступ к проекту ранее, значит, создатель или<br/>
                    администратор проекта удалил вас из списка участников проекта.</Typography>
                <br/>
            </Alert>
        </Snackbar>

    </>;
}
