import {Badge} from "react-bootstrap";
import Constants from "../../util/Constants";
import Methods from "../../util/Methods";
import {Alert, Button, MenuItem, Modal, Select, Snackbar} from "@mui/material";
import {useEffect, useState} from "react";
import {Edit} from "@mui/icons-material";
import {useLocalState} from "../../util/useLocalStorage";
import {useParams} from "react-router-dom";

export default function ProjectUserInfo({projectUserInfo, myInfo, myProjectRole}) {

    const {project_uuid: projectUUID} = useParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [settingsOpen, setSettingsOpen] = useState(false);

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

    useEffect(() => {
        setCanChangeRole(changeRoleValue !== projectRole);
    }, [changeRoleValue, projectRole]);

    function changeRole() {
        fetch(Methods.getIdeApiURL(`projectUser/setRole`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'PUT',
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
        <div className={'p-2 border border-dark d-flex flex-row'}>
            <div className={'d-flex flex-column'} style={{fontSize: '20px'}}>
                <h4 title={`${userNames['firstName']} ${userNames['lastName']}`}>{userNames['username']}</h4>
                <span>Роль: <Badge
                    title={projectRoleInfo.description}
                    className={`custom-badge mt-1 badge-${projectRoleInfo.color}`}
                >
                {projectRoleInfo['name'].toUpperCase()}
            </Badge></span>
                {lastChange ? <p
                    className={'c-pointer'}
                    title={Methods.fullDateTime(lastChangeDate)}
                >
                    Последние изменения: {Methods.datePast(lastChangeDate)}
                </p> : <br/>}
            </div>
            <div className={'d-flex flex-row align-items-center'}>
                {allowToChangeRole ? <>
                    <Button
                        style={{height: 'fit-content', minWidth: 0, padding: '10px 15px'}}
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
                        <div
                            className={'modal-center bg-white d-flex flex-column align-items-center text-center gap-4'}
                            style={{padding: '30px 40px'}}
                        >
                            <h3>Настройки участника проекта <span
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