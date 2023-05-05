import {useEffect, useState} from 'react';
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {useLocalState} from "../../util/useLocalStorage";
import ProjectListItem from "./ProjectListItem";
import {Badge, Stack} from "react-bootstrap";
import {
    Alert,
    Button,
    Container,
    IconButton,
    InputAdornment,
    MenuItem,
    Modal,
    Select,
    Snackbar,
    TextField
} from "@mui/material";
import {AddCircle, Clear} from "@mui/icons-material";
import ModalCloseIcon from "../ModalCloseIcon";
import {useSearchParams} from "react-router-dom";

export default function ProjectList({isAuthorizedSetter}) {

    const [searchParams, setSearchParams] = useSearchParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);
    const [projectList, setProjectList] = useState([]);

    const [listElements, setListElements] = useState([]);

    const [openProjectCreation, setOpenProjectCreation] = useState(false);

    const [newProjectName, setNewProjectName] = useState('Новый проект');
    const [newProjectType, setNewProjectType] = useState(Object.keys(Constants.PROJECT_TYPE_INFO)[0]);
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const [successCreateProjectToast, setSuccessCreateProjectToast] = useState(false);
    const [failCreateProjectToast, setFailCreateProjectToast] = useState(false);
    const [failCreateProjectToastMessage, setFailCreateProjectToastMessage] = useState('');

    const [successDeleteProjectToast, setSuccessDeleteProjectToast] = useState(false);

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
                    setNewProjectName('Новый проект');
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
                'projectType': newProjectType
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
        if (!searchParams) return;
        const afterAction = searchParams.get('afterAction');
        if (afterAction) {
            const actionHandlers = {
                'deleteProject': () => {
                    setSuccessDeleteProjectToast(true);
                }
            };
            actionHandlers[afterAction]();
            searchParams.delete('afterAction');
            setSearchParams(searchParams);
        }
    }, [searchParams]);

    useEffect(() => {
        getProjectList();
    }, []);

    useEffect(() => {
        let i = 0;
        const listElements = projectList.map(projectInfo =>
            <ProjectListItem className={'border'} key={i++} projectInfo={projectInfo}/>);
        setListElements(listElements);
    }, [projectList]);

    // noinspection JSValidateTypes
    return (<>
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

            <Stack direction={'vertical'} gap={4}>
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
                    <div style={{width: '80%', margin: '0 auto'}}>
                        <TextField
                            label={'Название проекта'}
                            className={'new-project-name-input'}
                            fullWidth
                            value={newProjectName}
                            onChange={event => setNewProjectName(event.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            style={{opacity: (newProjectName === '' ? 0.5 : 1)}}
                                            disabled={newProjectName === ''}
                                            title={'Очистить'}
                                            onClick={() => setNewProjectName('')}
                                        >
                                            <Clear/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
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
                    <Button
                        variant={'contained'}
                        style={{fontSize: 24, textTransform: "none"}}
                        onClick={() => createProject()}
                    >Создать проект</Button>
                </div>
            </div>
        </Modal>

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
    </>);
}
