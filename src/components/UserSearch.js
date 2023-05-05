import {useEffect, useState} from 'react';
import {Alert, Button, IconButton, MenuItem, Modal, Select, Snackbar, TextField, Typography} from "@mui/material";
import {AddCircle, Search} from "@mui/icons-material";
import Methods from "../util/Methods";
import {useLocalState} from "../util/useLocalStorage";
import Constants from "../util/Constants";
import {Badge, Stack} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {DefaultCopyField} from "@eisberg-labs/mui-copy-field";
import ModalCloseIcon from "./ModalCloseIcon";

export default function UserSearch({projectUsers, addProjectUser, myProjectRole, myInfo, projectType, closeFunction}) {

    const {project_uuid: projectUUID} = useParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [searchStr, setSearchStr] = useState('');

    const [users, setUsers] = useState([]);

    const [usernameToAdd, setUsernameToAdd] = useState('');

    const [changeRoleValue, setChangeRoleValue] = useState('');

    const [selectRoleOpen, setSelectRoleOpen] = useState(false);

    const [successAddUserToast, setSuccessAddUserToast] = useState(false);
    const [failAddUserToast, setFailAddUserToast] = useState(false);
    const [failAddUserToastMessage, setFailAddUserToastMessage] = useState('');

    useEffect(() => {
        setChangeRoleValue(['PUBLIC_WATCH', 'PUBLIC_EDIT'].includes(projectType)
            ? Constants.PROJECT_TYPE_INFO[projectType].defaultProjectRole
            : 'EDITOR');
    }, projectType);

    function findUsers(searchStr) {
        searchStr = searchStr.trim().toLowerCase();
        if (searchStr === '') return;

        fetch(Methods.getIdeApiURL('user/usernameLike'), {
            method: 'POST',
            headers: {'Content-Type': 'text/plain', 'Authorization': jwt},
            body: searchStr
        })
            .then(response => {
                return response.json();
            })
            .then(userList => {
                setSortedUsers(userList, searchStr);
            });
    }

    function setSortedUsers(users, searchStr) {
        let usernames = [...[...projectUsers].map(pu => pu['userInfo']['username']), myInfo['userNames']['username']];
        users = [...users].filter(usr => !usernames.includes(usr['userNames']['username']));
        users.sort((u1, u2) => {
            const username1 = u1['userNames']['username'];
            const username2 = u2['userNames']['username'];

            let index1 = (username1.toLowerCase()).indexOf(searchStr);
            let index2 = (username2.toLowerCase()).indexOf(searchStr);
            if (index1 !== 0) index1 = 1;
            if (index2 !== 0) index2 = 1;
            if (index1 !== index2) return index1 - index2;

            const change1 = u1['lastChange'];
            const change2 = u2['lastChange'];
            if (change1 != null && change2 != null) {
                const date1 = new Date(change1);
                const date2 = new Date(change2);
                if (date1 !== date2) return date2 - date1;
            }
            return (username1 < username2) ? -1 : (username1 > username2 ? 1 : 0);
        });
        setUsers(users);
    }

    function addParticipant(username) {
        const myPermissions = [...myProjectRole['permissions']];
        if (['PUBLIC_WATCH', 'PUBLIC_EDIT'].includes(projectType)
            && !(myPermissions.includes('SET_ADMIN_ROLE') || myPermissions.includes('SET_ROLES'))) {
            setRole(username, Constants.PROJECT_TYPE_INFO[projectType].defaultProjectRole);
            return;
        }
        setUsernameToAdd(username);
        setSelectRoleOpen(true);
    }

    function setRole(username, projectRole) {
        fetch(Methods.getIdeApiURL('projectUser/setRole'), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'POST',
            body: JSON.stringify({
                'username': username,
                'projectUUID': projectUUID,
                'newProjectRole': projectRole,
            })
        }).then(response => {
            return (response.status === 200)
                ? response.json()
                : Promise.reject(response);
        })
            .then(newProjectUser => {
                console.log(newProjectUser);
                setUsers(prev => prev.filter(usr => usr['userNames']['username'] !== username));
                addProjectUser(newProjectUser);
                setSelectRoleOpen(false);
                setSuccessAddUserToast(true);
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        setFailAddUserToastMessage(error['message']);
                        setFailAddUserToast(true);
                    });
            });
    }

    // noinspection JSValidateTypes
    return (
        <>
            <div className={'modal-center'}>
                <ModalCloseIcon closeFunction={closeFunction}/>
                <div className={'bg-white d-flex flex-column align-items-center text-center'}
                     style={{padding: 40}}>
                    <Typography variant={'h3'} style={{marginBottom: 30}}>Приглашение новых участников</Typography>
                    {['PUBLIC_WATCH', 'PUBLIC_EDIT'].includes(projectType) ? <div
                        className={'border border-dark border-opacity-50'}
                        style={{
                            whiteSpace: "pre-line",
                            borderRadius: 10,
                            padding: '10px 30px',
                            margin: '-10px 0 25px',
                            background: '#ebffe9',
                            fontSize: 18
                        }}
                    >
                        <p style={{textAlign: 'justify', color: '#306509',}}>&emsp; Вы можете пригласить новых
                            участников
                            проекта, просто отправив им ссылку на данный проект (тип проекта:
                            <b><i> {Methods.capitalize(Constants.PROJECT_TYPE_INFO[projectType].name)}</i></b>).
                            <b>&ensp;Ссылка для копирования:</b></p>
                        <div
                            className={'d-flex bg-white shadow'}
                            style={{
                                borderRadius: 10,
                                padding: '12px 7px 7px',
                                margin: '-5px 20px 3px',
                                fontWeight: 'bold'
                            }}
                        >
                            <DefaultCopyField
                                label="Нажмите на иконку справа, чтобы скопировать ссылку"
                                fullWidth className={'b-i-input'}
                                value={`http://localhost:3010/project/${projectUUID}/info`}/>
                        </div>
                        {/* todo hardcoded localhost link */}

                    </div> : <></>}
                    <div className={'d-flex flex-row'}>
                        <TextField
                            style={{marginRight: 40}}
                            label={'Поиск пользователей'}
                            value={searchStr}
                            onChange={event => setSearchStr(event.target.value)}
                        />
                        <Button
                            variant={"contained"}
                            size={"large"}
                            onClick={() => findUsers(searchStr)}
                        ><Search style={{marginRight: 10}}/>Найти</Button>
                    </div>
                    {users.length === 0 ? <br/> : <></>}
                    <p style={{fontSize: 20, marginTop: 15}}>
                        <i>Найдено пользователей: <b>{users.length}</b></i>
                    </p>
                    {users.length === 0
                        ? <></>
                        : <Stack
                            direction={'vertical'}
                            gap={2}
                            style={{
                                maxHeight: ['PUBLIC_WATCH', 'PUBLIC_EDIT'].includes(projectType) ? 300 : 450,
                                overflowY: "auto", borderRadius: 10
                            }}
                            className={'border border-dark border-opacity-50 p-3 shadow'}
                        >
                            {[...users].map(usr => // , ...users
                                <div
                                    className={'border border-dark border-opacity-25 d-flex flex-row user-info justify-content-between'}
                                    style={{padding: '10px 20px 15px', borderRadius: 8}}
                                    key={usr['userNames']['username']}
                                >

                                    <div
                                        className={'d-flex flex-column justify-content-around'}
                                        style={{fontSize: '20px'}}
                                    >
                                    <span style={{whiteSpace: 'nowrap', display: 'inline-flex'}}>
                                        <Typography
                                            variant={'h5'}
                                            title={`${usr['userNames']['firstName']} ${usr['userNames']['lastName']}`}
                                        >
                                            Пользователь <b style={{
                                            cursor: 'pointer'
                                        }}
                                        >{usr['userNames']['username']}</b>
                                        </Typography>
                                    </span>
                                        {usr['lastChange'] ? <p
                                            className={'c-pointer'}
                                            title={Methods.fullDateTime(new Date(usr['lastChange']))}
                                            style={{margin: '7px 0 -3px'}}
                                        >
                                            Последняя активность: {Methods.datePast(new Date(usr['lastChange']))}
                                        </p> : <></>}
                                    </div>
                                    <div
                                        className={'d-flex flex-row align-items-center project-user-edit'}
                                        style={{marginTop: 5, marginRight: 10}}
                                    >
                                        <IconButton variant={"contained"}
                                                    size={"large"}
                                                    title={'Добавить'} style={{padding: '0', margin: '-5px 0'}}
                                                    color={"success"}
                                                    onClick={() => addParticipant(usr['userNames']['username'])}
                                        ><AddCircle fontSize={"large"}/></IconButton>
                                    </div>
                                </div>)}
                        </Stack>}
                    <Modal
                        open={selectRoleOpen}
                        onClose={() => setSelectRoleOpen(false)}
                    >
                        <div className={'modal-center'}>
                            <ModalCloseIcon closeFunction={() => setSelectRoleOpen(false)}/>
                            <div
                                className={'bg-white p-4 d-flex flex-column gap-4 align-items-center'}
                            >
                                <Typography variant={"h4"} style={{textAlign: "center", margin: '10px 30px 0'}}>
                                    Добавление участника проекта <b>{usernameToAdd}</b>
                                </Typography>
                                <h3 style={{textAlign: "center", margin: '0 20px'}}>Выбор роли</h3>
                                <Select
                                    value={changeRoleValue}
                                    onChange={event => setChangeRoleValue(event.target.value)}
                                >{
                                    Object.keys(Constants.PROJECT_ROLE_INFO).map(projectRole => {
                                        if ((projectRole === 'PROJECT_ADMIN' && 'CREATOR' !== myProjectRole['projectRole'])
                                            || projectRole === 'CREATOR') return null;
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
                                    id={'submit'}
                                    type={'button'}
                                    size={"large"}
                                    onClick={() => setRole(usernameToAdd, changeRoleValue)}
                                >
                                    Добавить участника
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
            <Snackbar // ? SUCCESS ADD USER
                open={successAddUserToast}
                autoHideDuration={6000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setSuccessAddUserToast(false);
                }}
            >
                <Alert
                    severity={'success'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setSuccessAddUserToast(false);
                    }}
                >Участник проекта успешно добавлен!</Alert>
            </Snackbar>

            <Snackbar // ? FAIL ADD USER
                open={failAddUserToast}
                autoHideDuration={10000}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setFailAddUserToast(false);
                }}
            >
                <Alert
                    severity={'error'}
                    sx={{width: '100%'}}
                    onClose={(event, reason) => {
                        if (reason === 'clickaway') return;
                        setFailAddUserToast(false);
                    }}
                >{failAddUserToastMessage}</Alert>
            </Snackbar>
        </>
    );
}
