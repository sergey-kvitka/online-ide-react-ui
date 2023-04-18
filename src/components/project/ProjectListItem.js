import {Box, Link, Typography} from "@mui/material";
import {Badge} from "react-bootstrap";
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {Info} from "@mui/icons-material";
import NextLink from 'next/link';

export default function ProjectListItem({projectInfo}) {

    let lastOnline = projectInfo['lastChange'];
    let projectType = projectInfo['projectType'];
    let projectRole = projectInfo['projectRole'];

    const projectTypeInfo = Constants.PROJECT_TYPE_INFO[projectType];
    const projectRoleInfo = Constants.PROJECT_ROLE_INFO[projectRole];

    const projectUUID = projectInfo['projectUUID'];

    return (
        <Link
            className={'project-item flex-row border-1 text-nowrap no-style-link'}
            sx={{border: 1}}
            underline={"none"}
            title={'Перейти к проекту'}
            href={`/project/workspace/${projectUUID}`}
        >
            <div className={'project-item-half w-65'}>
                <Typography
                    className={'m-2'}
                    variant={'h4'}
                    component={'span'}
                >
                    {projectInfo['name']}
                </Typography>
                <div className={'d-flex flex-column project-own'}>
                    <span>Проект пользователя</span><span>{projectInfo['creatorInfo']['username']}</span>
                </div>
                <div className={'d-flex flex-column project-type'}>
                    <span>Тип проекта:</span>
                    <Badge
                        title={projectTypeInfo.description}
                        className={`custom-badge mt-1 badge-${projectTypeInfo.color}`}
                    >
                        {projectTypeInfo.name.toUpperCase()}
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
                    <div className={'d-flex flex-column text-wrap'} style={{marginRight: '30px'}}>
                        <span className={'text-center'}>Последняя ваша<br/>активность:</span>
                        <span className={'text-center text-decoration-underline'}>
                            {Methods.datePast(new Date(lastOnline))}.
                        </span>
                    </div>
                ) : <div style={{minHeight: 50}}/>}
            </div>
        </Link>
    );
};
