import {Terminal} from "@mui/icons-material";
import {AppBar, Link, Toolbar, Typography} from "@mui/material";
import {useEffect, useState} from "react";

const defaultText = 'Среда разработки';
const projectPages = ['WORKSPACE', 'PROJECT_INFO'];

export default function Header({currentProjectInfo, isAuthorized}) {

    const [headerText, setHeaderText] = useState(defaultText);
    const [page, setPage] = useState('');
    const [projectUUID, setProjectUUID] = useState(null);

    useEffect(() => {
        if (!currentProjectInfo) return;
        setHeaderText(textByProjectInfo(currentProjectInfo));
    }, [currentProjectInfo]);

    function textByProjectInfo(currentProjectInfo) {
        let page = currentProjectInfo['page'];
        if (!page) page = 'NONE';

        setPage(page);

        if (page === 'LOADING') return 'Загрузка...';
        if (projectPages.includes(page)) {
            setProjectUUID(currentProjectInfo['projectUUID']);
            return currentProjectInfo['projectName'];
        }
        return defaultText;
    }

    return (
        <AppBar className={'app-bar'} position={'sticky'}>
            <Toolbar className={'d-flex w-100'}>
                <span
                    style={{width: '25%', overflow: "hidden", whiteSpace: "nowrap", marginRight: 20}}
                >
                    <span
                        title={headerText}
                        className={'d-flex flex-row justify-content-start align-items-center'}
                    >
                        <Typography
                            component={'span'}
                            style={{fontSize: '3.8vh'}}
                        >
                            {headerText}
                        </Typography>
                        {headerText === defaultText
                            ? <Terminal
                                fontSize={'large'}
                                style={{marginTop: 5.5, marginLeft: '2vh', height: '4vh'}}
                            /> : <></>}
                    </span>
                </span>

                {projectPages.includes(page) && projectUUID
                    ? (page === 'WORKSPACE'
                            ? <Link
                                className={'no-style-link'}
                                href={`/project/${projectUUID}/info`}
                            >О проекте</Link>
                            : (page === 'PROJECT_INFO'
                                ? <Link
                                    className={'no-style-link'}
                                    href={`/project/workspace/${projectUUID}`}
                                >Перейти в рабочее пространство</Link>
                                : <></>)
                    ) : <></>}
                <div style={{flexGrow: 10}}/>
                {isAuthorized
                    ? <Link
                        className={'no-style-link'}
                        href={'/projects'}
                        style={{marginRight: '3vw'}}
                    >Мои проекты</Link>
                    : <></>}
                {isAuthorized
                    ? <Link
                        className={'no-style-link'}
                        href={'/login'}
                        style={{marginRight: '1.5vw'}}
                    >Выйти</Link>
                    : <></>}
            </Toolbar>
        </AppBar>
    );
};
