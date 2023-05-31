// noinspection JSValidateTypes

import {Box, Button, IconButton, Link, Modal, Typography} from "@mui/material";
import {Badge} from "react-bootstrap";
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {Clear, Info} from "@mui/icons-material";
import NextLink from 'next/link';
import {useState} from "react";
import ModalCloseIcon from "../ModalCloseIcon";
import {useLocalState} from "../../util/useLocalStorage";

const HIDDEN_LEFT = -35;

export default function ProjectListItem({projectInfo, projectLeaveHandler}) {

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const lastOnline = projectInfo['lastChange'];
    const projectType = projectInfo['projectType'];
    const projectRole = projectInfo['projectRole'];
    const projectBuildType = projectInfo['projectBuildType'];

    const projectTypeInfo = Constants.PROJECT_TYPE_INFO[projectType];
    const projectRoleInfo = Constants.PROJECT_ROLE_INFO[projectRole];
    const projectBuildTypeInfo = Constants.BUILD_TYPE_INFO[projectBuildType];

    const projectUUID = projectInfo['projectUUID'];

    const [leaveButtonLeft, setLeaveButtonLeft] = useState(HIDDEN_LEFT);

    const [projectLeaveOpen, setProjectLeaveOpen] = useState(false);

    const showLeaveButton = () => setLeaveButtonLeft(0);
    const hideLeaveButton = () => setLeaveButtonLeft(HIDDEN_LEFT);

    const handleLinkHover = () => {
        showLeaveButton();
    };

    const handleLinkUnHover = () => {
        hideLeaveButton();
    };

    function leaveProject() {
        fetch(Methods.getIdeApiURL(`projectUser/leaveProject/${projectUUID}`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(() => {
                projectLeaveHandler(projectUUID);
            });
    }

    return (<>
        <div
            className={'project-item'}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkUnHover}
        >
            <Link
                className={'project-item flex-row border-dark border border-opacity-50 text-nowrap no-style-link shadow'}
                style={{borderRadius: 10, zIndex: 2}}
                underline={"none"}
                title={'Перейти к проекту'}
                href={`/project/workspace/${projectUUID}`}
                aria-describedby={`proj-link-${projectUUID}`}
            >
                <div className={'project-item-half w-65'}>
                    <Typography
                        className={'m-2'}
                        variant={'h4'}
                        component={'span'}
                        title={projectInfo['name']}
                        style={{overflow: 'hidden'}}
                    >
                        {projectInfo['name']}
                    </Typography>
                    <div className={'d-flex flex-column project-own'} style={{fontSize: 20}}>
                        <span>Проект пользователя</span><span>{projectInfo['creatorInfo']['username']}</span>
                    </div>
                    <div className={'d-flex flex-column project-type'}>
                        <span style={{fontSize: 18}}>Тип проекта:</span>
                        <Badge
                            title={projectTypeInfo.description}
                            className={`custom-badge mt-1 badge-${projectTypeInfo.color}`}
                        >
                            {projectTypeInfo.name.toUpperCase()}
                        </Badge>
                        <span style={{fontSize: 18, marginTop: 3}}>Тип сборки проекта:</span>
                        <Badge
                            title={projectBuildTypeInfo.description}
                            className={`custom-badge mt-1 badge-${projectBuildTypeInfo.color}`}
                        >
                            {projectBuildTypeInfo.name.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                <div className={'project-item-half w-35'}>
                    <div className={'d-flex flex-column project-role'}>
                        <span>Ваша роль:</span>
                        <Badge
                            title={projectRoleInfo.description}
                            className={`custom-badge mt-1 badge-${projectRoleInfo.color}`}
                        >
                            {projectRoleInfo.name.toUpperCase()}
                        </Badge>
                    </div>
                    <div className={'d-flex justify-content-end'}>
                        <Box sx={{mt: 2, mr: 4, mb: 1}}>
                            <NextLink
                                href={`/project/${projectUUID}/info`}
                                className={'rounded-circle'}
                                title={'Информация о проекте'}
                                style={{width: "fit-content"}}
                                sx={{overflow: 'hidden', padding: 0}}
                            >
                                <Info
                                    sx={{color: '#0101d5', cursor: 'pointer'}}
                                    fontSize={'large'}
                                />
                            </NextLink>
                        </Box>
                    </div>
                    {lastOnline ? (
                        <div className={'d-flex flex-column text-wrap'} style={{marginRight: '30px', fontSize: 18}}>
                            <span className={'text-center'}>Последняя ваша<br/>активность:</span>
                            <span style={{whiteSpace: "nowrap"}}
                                  className={'text-center text-decoration-underline'}>
                            {Methods.datePast(new Date(lastOnline))}.
                        </span>
                        </div>
                    ) : <div style={{minHeight: 50}}/>}
                </div>
            </Link>

            <div className={'no-pad no-margin position-relative'} style={{width: 0, height: '100%'}}>
                {projectRole === 'CREATOR' ? <></> :
                    <div
                        className={'position-absolute'}
                        style={{top: 5, left: leaveButtonLeft, transition: '.35s ease all', zIndex: 1}}
                    >
                        <IconButton
                            size={"small"}
                            title={'Выйти из проекта'}
                            onClick={() => setProjectLeaveOpen(true)}
                        >
                            <Clear
                                color={"error"}
                                fontSize={"large"}
                            />
                        </IconButton>
                    </div>
                }
            </div>
        </div>

        <Modal
            open={projectLeaveOpen}
            onClose={() => setProjectLeaveOpen(false)}
        >
            <div className={'modal-center'}>
                <ModalCloseIcon closeFunction={() => setProjectLeaveOpen(false)}/>
                <div
                    className={'bg-white d-flex flex-column gap-4 align-items-center p-5'}
                >
                    <Typography variant={"h4"} textAlign={"center"}>
                        Вы действительно хотите покинуть<br/>проект <b>{projectInfo['name']}</b>?
                    </Typography>
                    <div
                        className={'d-flex flex-row justify-content-center gap-5 mt-1'}
                        style={{marginBottom: 10}}
                    >
                        <Button
                            variant={'contained'}
                            color={"info"}
                            size={'large'}
                            onClick={() => setProjectLeaveOpen(false)}
                        >
                            Отменить
                        </Button>
                        <Button
                            variant={'contained'}
                            color={"error"}
                            size={'large'}
                            onClick={() => {
                                leaveProject();
                            }}
                        >
                            Покинуть
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    </>);
};
