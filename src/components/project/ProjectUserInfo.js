import {Badge} from "react-bootstrap";
import Constants from "../../util/Constants";
import Methods from "../../util/Methods";
import {Alert, Button, MenuItem, Modal, Select, Snackbar, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {DeleteForever, Edit} from "@mui/icons-material";
import {useLocalState} from "../../util/useLocalStorage";
import {useParams} from "react-router-dom";
import ModalCloseIcon from "../ModalCloseIcon";

export default function ProjectUserInfo({projectUserInfo, myInfo, myProjectRole, deleteProjectUser}) {

    const {project_uuid: projectUUID} = useParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);

    const [changeRoleValue, setChangeRoleValue] = useState(projectUserInfo['projectRole']);
    const [canChangeRole, setCanChangeRole] = useState(false);
    const [successChangeRoleToast, setSuccessChangeRoleToast] = useState(false);
    const [failChangeRoleToast, setFailChangeRoleToast] = useState(false);
    const [failChangeRoleMessage, setFailChangeRoleMessage] = useState('');

    const userNames = projectUserInfo['userInfo'];
    const lastChange = projectUserInfo['lastChange'];
    const lastChangeDate = new Date(lastChange);

    const myRole = myProjectRole['projectRole']
    const myPermissions = myProjectRole['permissions'];

    const projectRole = projectUserInfo['projectRole'];
    const projectRoleInfo = Constants.PROJECT_ROLE_INFO[projectRole];

    let allowToChangeRole = !(
        (userNames['username'] === myInfo['userNames']['username'])
        || (projectRole === 'CREATOR')
        || (projectRole === 'PROJECT_ADMIN' && myRole !== 'CREATOR')
        || !(myPermissions.includes(Constants.PERMISSIONS.SET_ROLES))
    );

    let allowToAddOrDeleteUser = !(
        (userNames['username'] === myInfo['userNames']['username'])
        || (projectRole === 'CREATOR')
        || (projectRole === 'PROJECT_ADMIN' && myRole !== 'CREATOR')
        || !(myPermissions.includes(Constants.PERMISSIONS.ADD_AND_DELETE_USERS))
    );

    useEffect(() => {
        setCanChangeRole(changeRoleValue !== projectRole);
    }, [changeRoleValue, projectRole]);

    function changeRole() {
        fetch(Methods.getIdeApiURL(`projectUser/setRole`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'POST',
            body: JSON.stringify({
                'username': userNames['username'],
                'projectUUID': projectUUID,
                'newProjectRole': changeRoleValue,
            })
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(response);
            })
            .then(() => {
                projectUserInfo['projectRole'] = changeRoleValue;
                setSettingsOpen(false);
                setSuccessChangeRoleToast(true);
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        setFailChangeRoleMessage(error['message']);
                        setFailChangeRoleToast(true);
                    });
            });
    }


    // noinspection JSValidateTypes
    return (<>
        <div
            className={'border border-dark border-opacity-25 d-flex flex-row user-info justify-content-between'}
            style={{padding: '10px 20px 15px', borderRadius: 8}}
        >
            <div
                className={'d-flex flex-column'}
                style={{fontSize: '20px'}}
            >
                <span style={{whiteSpace: 'nowrap', display: 'inline-flex'}}>
                    <Typography
                        variant={'h5'}
                        title={`${userNames['firstName']} ${userNames['lastName']}`}
                    >Пользователь <b style={{cursor: 'pointer'}}>{userNames['username']}</b></Typography>
                    {myInfo['userNames']['username'] === userNames['username'] ? <p
                        style={{marginLeft: 10, marginBottom: 0, fontStyle: 'italic', color: 'rgb(26,180,1)'}}
                    >(вы)</p> : <></>}
                </span>
                <span style={{marginTop: 5}}>Роль: <Badge
                    title={projectRoleInfo.description}
                    className={`custom-badge mt-1 badge-${projectRoleInfo.color}`}
                    style={{marginLeft: 5}}
                >
                {projectRoleInfo['name'].toUpperCase()}
                </Badge></span>
                {lastChange ? <p
                    className={'c-pointer'}
                    title={Methods.fullDateTime(lastChangeDate)}
                    style={{margin: '7px 0 -3px'}}
                >
                    Последние изменения: {Methods.datePast(lastChangeDate)}
                </p> : <></>}
            </div>
            <div
                className={'d-flex flex-row align-items-center project-user-edit'}
                style={{marginTop: 5, marginRight: 10}}
            >
                {allowToAddOrDeleteUser ? <>
                    <Button
                        style={{height: 'fit-content', minWidth: 0, padding: '10px 15px', margin: '0 15px'}}
                        variant={"contained"}
                        className={'bg-warning'}
                        onClick={() => setSettingsOpen(true)}
                        title={'Настройки участника проекта'}
                    >
                        <Edit/>
                    </Button>

                    <Modal
                        open={settingsOpen}
                        onClose={() => setSettingsOpen(false)}
                    >
                        <div className={'modal-center'}>
                            <ModalCloseIcon closeFunction={() => setSettingsOpen(false)}/>
                            <div
                                className={'bg-white d-flex flex-column align-items-center text-center gap-4'}
                                style={{padding: '30px 40px'}}
                            >
                                <h3 style={{marginTop: 5}}>Настройки участника проекта <span
                                    style={{color: '#3232b4'}}
                                >{userNames['username']}</span></h3>
                                <h4>Изменение роли</h4>
                                <Select
                                    value={changeRoleValue}
                                    onChange={event => setChangeRoleValue(event.target.value)}
                                >{
                                    Object.keys(Constants.PROJECT_ROLE_INFO).map(projectRole => {
                                        if (projectRole === 'CREATOR'
                                            || (projectRole === 'PROJECT_ADMIN' && myRole !== 'CREATOR')) return null;
                                        const _projectRoleInfo = Constants.PROJECT_ROLE_INFO[projectRole];
                                        return <MenuItem
                                            value={projectRole}
                                            key={projectRole}
                                        >
                                            <Badge className={`custom-badge badge-${
                                                _projectRoleInfo.color
                                            }`}>
                                                {_projectRoleInfo.name.toUpperCase()}
                                            </Badge>
                                        </MenuItem>;
                                    })
                                }</Select>
                                <Button
                                    variant={'contained'}
                                    disabled={!canChangeRole}
                                    id={'submit'}
                                    type={'button'}
                                    onClick={() => changeRole()}
                                >
                                    Изменить роль
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </> : <></>}
                {allowToChangeRole ? <>
                    <Button
                        style={{height: 'fit-content', minWidth: 0, padding: '10px 15px'}}
                        variant={"contained"}
                        className={'bg-danger'}
                        onClick={() => setDeleteUserDialogOpen(true)}
                        title={'Удалить участника проекта'}
                    >
                        <DeleteForever/>
                    </Button>

                    <Modal
                        open={deleteUserDialogOpen}
                        onClose={() => setDeleteUserDialogOpen(false)}
                    >
                        <div className={'modal-center'}>
                            <ModalCloseIcon closeFunction={() => setDeleteUserDialogOpen(false)}/>
                            <div className={'bg-white p-4 gap-4'}>
                                <Typography variant={'h4'} align={"center"} style={{marginTop: 5}}>
                                    Вы действительно хотите удалить участника проекта <b>{
                                    userNames['firstName']} {userNames['lastName']}</b> (<b>{
                                    userNames['username']}</b>)?</Typography>
                                <br/>
                                <div
                                    className={'d-flex flex-row justify-content-center gap-5 mt-1'}
                                    style={{marginBottom: 10}}
                                >
                                    <Button
                                        variant={'contained'}
                                        color={"info"}
                                        size={'large'}
                                        onClick={() => setDeleteUserDialogOpen(false)}
                                    >
                                        Отменить удаление
                                    </Button>
                                    <Button
                                        variant={'contained'}
                                        color={"error"}
                                        size={'large'}
                                        onClick={() => deleteProjectUser(
                                            userNames['username'],
                                            setDeleteUserDialogOpen)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                </> : <></>}
            </div>
        </div>

        <Snackbar // ? SUCCESS CHANGE ROLE
            open={successChangeRoleToast}
            autoHideDuration={6000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setSuccessChangeRoleToast(false);
            }}
        >
            <Alert
                severity={'success'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setSuccessChangeRoleToast(false);
                }}
            >Роль участника проекта успешно изменена!</Alert>
        </Snackbar>

        <Snackbar // ? FAIL CHANGE ROLE
            open={failChangeRoleToast}
            autoHideDuration={10000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setFailChangeRoleToast(false);
            }}
        >
            <Alert
                severity={'error'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setFailChangeRoleToast(false);
                }}
            >{failChangeRoleMessage}</Alert>
        </Snackbar>
    </>);
};