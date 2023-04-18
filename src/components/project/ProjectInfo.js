import {useEffect, useState} from 'react';
import {Navigate, useParams} from "react-router-dom";
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {useLocalState} from "../../util/useLocalStorage";
import {Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography} from "@mui/material";
import {Badge, Stack} from "react-bootstrap";
import ProjectUserInfo from "./ProjectUserInfo";

export default function ProjectInfo() {

    const {project_uuid: projectUUID} = useParams();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [ok, setOk] = useState(true);

    const [projectInfo, setProjectInfo] = useState(null);
    const [myInfo, setMyInfo] = useState(null);
    const [projectUsers, setProjectUsers] = useState(null);
    const [projectRole, setProjectRole] = useState(null);

    const [creatorInfo, setCreatorInfo] = useState(null);
    const [projectTypeInfo, setProjectTypeInfo] = useState(null);

    const [initData, setInitData] = useState(false);

    const [usersOpen, setUsersOpen] = useState(false);

    function getProjectInfo() {
        fetch(Methods.getIdeApiURL(`project/${projectUUID}/info`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject();
            })
            .then(projectInfo => {
                setProjectInfo(projectInfo);
            })
            .catch(() => {
                setOk(false);
            });
    }

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

    useEffect(() => {
        async function init() {
            getProjectInfo();
            getMyInfo();
            getProjectUsers();
            getProjectRole();
        }

        init().then();
    }, []);

    useEffect(() => {
        if (!projectInfo) return;
        setCreatorInfo(projectInfo['creatorInfo']);
        setProjectTypeInfo(Constants.PROJECT_TYPE_INFO[projectInfo['projectType']]);
    }, [projectInfo]);

    const initDataDeps = [projectInfo, myInfo, projectUsers, projectRole, creatorInfo, projectTypeInfo];
    useEffect(() => {
        setInitData(initDataDeps.reduce((a, b) => a && b, true));
    }, initDataDeps);

    return !ok ? <Navigate to={'/projects'}/> : !initData ? <></> : (
        <Container>
            <p>Проект</p>
            <Typography
                variant={'h3'}
            >
                {projectInfo['name']}
            </Typography>
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
            <Typography variant={'h5'}>
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
            <p>Описание</p>
            <Box className={'border-1'}>
                {projectInfo['description']}
            </Box>
            <p>Количество файлов в проекте: {projectInfo['projectFilesAmount']}</p>

            <Accordion className={'border border-opacity-25 border-dark'} expanded={usersOpen} onChange={() => setUsersOpen(!usersOpen)}>
                <AccordionSummary component={"h4"}>
                    Участники проекта ({projectUsers.length})
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction={'vertical'} gap={4}>
                        {projectUsers.map(projectUser =>
                            <ProjectUserInfo
                                className={'border-1'}
                                key={projectUser['projectUserId']}
                                projectUserInfo={projectUser}
                                myInfo={myInfo}
                                myProjectRole={projectRole}
                            />
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Container>
    );
};
