// noinspection JSCheckFunctionSignatures,JSUnresolvedFunction,HttpUrlsUsage

import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from "react-router-dom";
import Methods from "../../util/Methods";
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";
import {
    Alert,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Modal,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import {io} from "socket.io-client";
import {
    DataObject,
    Help,
    History,
    KeyboardDoubleArrowDown,
    KeyboardDoubleArrowUp,
    PlayArrow,
    Settings,
    Stop
} from "@mui/icons-material";
import NewFileEditor from "../editor/NewFileEditor";
import ProjectTree from "../projectTree/ProjectTree";
import LastChangeInfo from "./LastChangeInfo";
import ProjectMonitoring from "./ProjectMonitoring";
import ModalCloseIcon from "../ModalCloseIcon";
import DiffList from "../editor/DiffList";
import ProjectRunInfo from "./ProjectRunInfo";
import CodeGenerator from "../editor/CodeGenerator";

export default function Workspace({currentProjectInfoSetter, isAuthorizedSetter}) {

    const {
        project_uuid: projectUUID,
        file_uuid: docId
    } = useParams();

    const [socket, setSocket] = useState();
    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [myInfo, setMyInfo] = useState(null);

    const [documentId, setDocumentId] = useState(docId);

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

    const setDocId = id => {
        if (documentId === id) return;
        setShowEditor(false);
        setDocumentId(id);
    };

    const updateFilesAndFolders = () => {
        getFilesAndFolders();
    }

    const [showEditor, setShowEditor] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [filesAndFolders, setFilesAndFolders] = useState([]);
    const [filesAndFoldersIds, setFilesAndFoldersIds] = useState([]);
    const [fileTree, setFileTree] = useState(null);
    const [projectRole, setProjectRole] = useState(null);

    const [projectInfo, setProjectInfo] = useState(null);

    const [fileIds, setFileIds] = useState([]);

    const [showExecResult, setShowExecResult] = useState(false);
    const [execResult, setExecResult] = useState(null);
    const [processExecuting, setProcessExecuting] = useState(false);
    const [wideExecResult, setWideExecResult] = useState(false);

    const execLogRef = useRef(null);

    const [projectRunCheckingInterval, setProjectRunCheckingInterval] = useState(2);
    const [projectRunChecking, setProjectRunChecking] = useState(false);
    const [mavenExecInfo, setMavenExecInfo] = useState(null);
    const [mavenExecStopping, setMavenExecStopping] = useState(false);
    const [mavenActualInfo, setMavenActualInfo] = useState(false);

    const [groupId, setGroupId] = useState(null);
    const [applicationPort, setApplicationPort] = useState(8080);

    const runInfoHandler = result => {
        setMavenActualInfo(true);
        if (!result) {
            setProjectRunCheckingInterval(2);
            return;
        }
        setProjectRunCheckingInterval(1);
        const isFinished = result['isFinished'];
        if (isFinished) setMavenExecStopping(false);
        setProcessExecuting(!isFinished);
        setMavenExecInfo({'deployPort': result['deployPort'], 'status': result['status']});
        setShowExecResult(true);
        setExecResult(prev => {
            let newLogs = result['logs'];
            if (!newLogs) return prev;
            if (!prev) return {'output': newLogs};
            let prevLogs = prev['output'];
            const prevLength = prevLogs.length;
            const newLength = prevLogs.length;
            if (equalsArrays(prevLogs, newLogs)) return prev;
            if (prevLength <= newLength) return {'output': newLogs};
            if (equalsArrays(newLogs.slice(0, prevLength), prevLogs)) {
                prevLogs.push(newLogs.slice(prevLength));
                return {'output': prevLogs};
            }
            return {'output': newLogs};
        });
    }

    function sendMavenExecRequest(files, projectUUID, groupId, artifactId, applicationPort) {
        setProcessExecuting(true);
        const body = JSON.stringify({
            'files': files,
            'projectUUID': projectUUID,
            'groupId': groupId,
            'artifactId': artifactId,
            'applicationPort': applicationPort
        });
        fetch(Methods.getExecApiURL('mavenExec'), {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: body
        }).then(response => {
            if (response.status === 200) {
                setShowExecResult(true);
                setProjectRunCheckingInterval(1);
            }
        }).catch(() => {
            setProcessExecuting(false);
        });
    }

    function sendMavenStopRequest() {
        if (mavenExecStopping) return;
        setMavenExecStopping(true);
        fetch(Methods.getExecApiURL(`stopMavenExec/${projectUUID}`), {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        }).then(() => {
        }).catch(() => {
            setMavenExecStopping(false);
        });
    }

    const [codeGenerateOptions, setCodeGenerateOptions] = useState(null);

    const [openCodeGen, setOpenCodeGen] = useState(false);

    const codeGenerateHandler = options => {
        setCodeGenerateOptions(options);
        const source = options['source'];
        if (source === 'codeGen') setOpenCodeGen(false);
        else if (source === 'diff') setHistoryOpen(false);
    };

    useEffect(() => {
        if (!execResult || !execLogRef) return;
        if (!execLogRef.current) return;
        execLogRef.current.scrollBy(/*0, 10_000*/ {behavior: 'smooth', top: 10_000});
    }, [execResult, execLogRef]);

    const [openExecConfig, setOpenExecConfig] = useState(false);

    const [mainClass, setMainClass] = useState('');
    const [args, setArgs] = useState('');
    const [mainClassInput, setMainClassInput] = useState('');
    const [argsInput, setArgsInput] = useState('');
    const [defaultConfigSaved, setDefaultConfigSaved] = useState(false);

    const setMainClassByFile = path => {
        if (defaultConfigSaved) return;
        let _path = path;
        if (!_path.endsWith('.java')) return;
        _path = _path.slice(0, -5).replaceAll('/', '.');
        setMainClassInput(_path);
    }

    const saveConfigInput = () => {
        setMainClass(mainClassInput.trim());
        setArgs(argsInput);
        setDefaultConfigSaved(true);
    }

    const [lastChanges, setLastChanges] = useState([]);

    const [stopMonitor, setStopMonitor] = useState(true);
    const [hidePage, setHidePage] = useState(false);
    const [monitorMessage, setMonitorMessage] = useState('');

    const [historyOpen, setHistoryOpen] = useState(false);

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
                setProjectInfo(projectInfo);
                setGroupId(projectInfo['groupId']);
                if (projectInfo['projectBuildType'] === 'MAVEN') setProjectRunChecking(true);
                getProjectRole();
                getFilesAndFolders();
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

    const getFilesAndFolders = () => {
        fetch(Methods.getIdeApiURL(`file/${projectUUID}/allFilesAndFolders`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(filesAndFolders => {
                setFilesAndFolders(filesAndFolders);
            });
    }

    useEffect(() => {
        isAuthorizedSetter(true);
    }, []);

    useEffect(() => {
        let result;
        if (!projectInfo) result = ({'page': 'LOADING'});
        else result = ({
            'projectName': projectInfo['name'],
            'projectUUID': projectUUID,
            'page': 'WORKSPACE'
        });
        if (!(!myInfo)) result = {...result, 'user': myInfo};
        currentProjectInfoSetter(result);
    }, [projectInfo, projectUUID, myInfo]);

    useEffect(() => {
        getProjectInfo();
        getMyInfo();
    }, []);

    useEffect(() => {
        if (docId && documentId !== docId) setDocId(docId);
        if (!documentId || !filesAndFolders) return;
        setShowEditor(true);
        const selectedFile = filesAndFolders.find(file => file['contentId'] === documentId);
        if (!selectedFile) setDocumentId(null);
        setSelectedFile(selectedFile);
    }, [documentId, filesAndFolders]);

    useEffect(() => {
        setFileTree(filesToTree(filesAndFolders));
        setStopMonitor(false);
        // setHideTree(false);
        setFilesAndFoldersIds(filesAndFolders.map(file => {
            return (
                (file['isFolder'] ? 'folder' : 'file') +
                file['id']);
        }));
        setFileIds(filesAndFolders.filter(file => !file['isFolder']).map(file => file['contentId']));
    }, [filesAndFolders]);

    useEffect(() => { // ! connecting to the socket
        const sct = io('http://localhost:3030');
        setSocket(sct);
        return () => {
            sct.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.emit('get-project-content', projectUUID);
    }, [socket, projectUUID]);

    useEffect(() => {
        if (!socket || !projectUUID || !filesAndFolders) return;
        const responseEvent = `project-content-response-${projectUUID}`;
        const responseHandler = response => {
            let buildType = response['buildType'];
            let documents = [...response['documents']].map(doc => {
                const file = filesAndFolders.find(file => file['contentId'] === doc['id']);
                return {...doc, 'path': (file['path']).replaceAll('/', '\\\\')};
            });

            if (buildType === 'DEFAULT') {
                sendExecRequest(projectUUID, documents, mainClass,
                    args === '' ? [] : args.split(' '));
            }
            if (buildType === 'MAVEN') {
                sendMavenExecRequest(documents, projectUUID, groupId, projectInfo['name'], applicationPort);
            }
        };

        socket.on(responseEvent, responseHandler);

        return () => {
            socket.off(responseEvent, responseHandler);
        }
    }, [socket, projectUUID, filesAndFolders, mainClass, projectInfo, args, groupId, projectInfo, applicationPort]);

    const sendContentRequest = () => {
        socket.emit(`project-content-request-${projectUUID}`, {
            'fileIds': [...fileIds],
            'buildType': projectInfo['projectBuildType']
        });
    }

    function sendExecRequest(projectId, files, mainClass, args) {
        const bodyStr = JSON.stringify({
            'projectId': projectId,
            'mainClass': mainClass,
            'files': files,
            'args': args
        });
        setProcessExecuting(true);
        fetch(Methods.getExecApiURL('exec'), {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: bodyStr
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(response);
            })
            .then(result => {
                setExecResult(result);
                setShowExecResult(true);
            })
            .finally(() => {
                setProcessExecuting(false);
            });
    }

    useEffect(() => {
        if (monitorMessage === '' || !monitorMessage) return;
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

    const handleMonitorMessage = (message) => {
        setMonitorMessage(message);
    }

    const changeListHandler = (changes) => {
        setLastChanges(changes);
    }

    const filesUpdateHandler = () => {
        setStopMonitor(true);
        // setHideTree(true);
        getFilesAndFolders(true);
    }

    // noinspection HttpUrlsUsage
    return hidePage ? (
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
    ) : (<>
            {(projectUUID && projectRole && jwt) ?
                <ProjectMonitoring
                    jwt={jwt}
                    projectUUID={projectUUID}
                    currentProjectRole={projectRole['projectRole']}
                    filesAndFolders={filesAndFolders}
                    messageHandler={handleMonitorMessage}
                    changeListHandler={changeListHandler}
                    filesUpdateHandler={filesUpdateHandler}
                    stop={stopMonitor}
                /> : <></>}

            {(projectRunChecking && projectUUID) ?
                <ProjectRunInfo
                    projectRunChecking={projectRunChecking}
                    projectUUID={projectUUID}
                    intervalTime={projectRunCheckingInterval}
                    runInfoHandler={runInfoHandler}
                /> : <></>}

            <div className={'d-flex flex-row workspace-page'}>

                <div
                    style={{flex: 'none', maxWidth: '25%', minWidth: '12%', overflowX: 'scroll', overflowY: 'scroll'}}
                >
                    {
                        ((projectRole && fileTree && (filesAndFoldersIds.length !== 0) && projectInfo && projectUUID) ?
                            <ProjectTree
                                projectInfo={{...projectInfo, 'uuid': projectUUID}}
                                ids={filesAndFoldersIds}
                                tree={fileTree}
                                projectRole={projectRole['projectRole']}
                                selected={documentId}
                                documentIdSetter={setDocId}
                                fileUpdateHandler={updateFilesAndFolders}
                            /> : <></>)}
                </div>
                <div
                    className={'d-flex flex-column'}
                    style={{
                        flex: 2,
                        height: '93vh',
                        maxHeight: '100%',
                        overflow: 'hidden',
                        borderLeft: '1px solid #888888'
                    }}
                >

                    <>
                        <div style={{height: 45}} className={'editor-panel'}>
                            <h5 className={'flex-lg-grow-1'}>{selectedFile ? selectedFile['path'] : ''}</h5>

                            {(((projectRole && !['COMMENTER', 'WATCHER'].includes(projectRole['projectRole'])))
                                && selectedFile && codeGenAvailable(selectedFile['path']))
                                ? <div
                                    className={'d-flex flex-row align-items-center code-gen-button'}
                                    style={{cursor: "pointer", marginRight: 30}}
                                    onClick={() => setOpenCodeGen(true)}
                                >
                                    <div
                                        className={'d-flex flex-column justify-content-center align-items-end'}
                                        style={{fontSize: 16, color: '#008800', fontFamily: 'Consolas, serif'}}
                                    >
                                        <Typography style={{
                                            fontFamily: "inherit",
                                            fontSize: 'inherit', marginBottom: -8
                                        }}>генерация</Typography>
                                        <Typography
                                            style={{fontFamily: "inherit", fontSize: 'inherit'}}>кода</Typography>
                                    </div>
                                    <DataObject fontSize={'large'} style={{color: '#008800'}}/>
                                </div>
                                : <></>}

                            {
                                (lastChanges.length > 0) ? <>
                                    <Typography variant={'h6'}>Последние изменения:</Typography>
                                    <div className={'d-flex align-items-center'}
                                         style={{flexDirection: "row-reverse", marginRight: 40, marginLeft: 15}}
                                    >
                                        {[...lastChanges].reverse().map(change => <LastChangeInfo
                                            lastChange={change}
                                            key={change['userNames']['username']}/>)}
                                    </div>
                                </> : <></>
                            }

                            {(selectedFile) ?
                                <IconButton
                                    style={{marginRight: 40}}
                                    title={'Посмотреть историю изменений'}
                                    onClick={() => setHistoryOpen(true)}
                                >
                                    <History fontSize={'large'}/>
                                </IconButton> : <></>}

                            {(projectRole && !['COMMENTER', 'WATCHER'].includes(projectRole['projectRole'])) ? <>

                                <IconButton
                                    onClick={() => {
                                        if (defaultConfigSaved) {
                                            setMainClassInput(mainClass);
                                            setArgsInput(args);
                                        }
                                        setOpenExecConfig(true);
                                    }}
                                    style={{background: '#21252b', padding: 3, borderRadius: 7, margin: 5}}
                                >
                                    <Settings style={{color: '#29c468'}}/>
                                </IconButton>

                                <IconButton
                                    onClick={() => {
                                        if (processExecuting && !projectRunChecking) return;
                                        const isMaven = projectInfo['projectBuildType'] === 'MAVEN';
                                        if (isMaven && !mavenActualInfo) return;
                                        if (processExecuting && projectRunChecking) {
                                            sendMavenStopRequest();
                                            return;
                                        }
                                        if (!isMaven && !defaultConfigSaved) {
                                            if (defaultConfigSaved) {
                                                setMainClassInput(mainClass);
                                                setArgsInput(args);
                                            }
                                            setOpenExecConfig(true);
                                            return;
                                        }
                                        setExecResult(null);
                                        setShowExecResult(false);
                                        sendContentRequest();
                                    }}
                                    style={{background: '#21252b', padding: 3, borderRadius: 7, margin: 5}}
                                >
                                    {processExecuting
                                        ? (projectRunChecking
                                            ? (mavenExecStopping
                                                ? <CircularProgress size={20} style={{margin: 2, color: '#f6bb3a'}}/>
                                                : <Stop style={{color: 'rgb(199,84,80)'}}/>)
                                            : <CircularProgress size={20} style={{margin: 2, color: '#f6bb3a'}}/>)
                                        : <PlayArrow style={{color: '#29c468'}}/>}
                                </IconButton>

                            </> : null}
                        </div>
                        <div style={{marginTop: 10, height: 'max-content'}}
                             className={`d-flex flex-column editor-container editor-cont-${documentId}`}>
                            <div style={{height: '100%'}}>
                                {
                                    (showEditor && projectRole && selectedFile)
                                        ? <NewFileEditor
                                            documentId={documentId}
                                            projectUUID={projectUUID}
                                            projectRole={projectRole['projectRole']}
                                            filePath={selectedFile['path']}
                                            pathHandler={setMainClassByFile}
                                            codeGenerateOptions={codeGenerateOptions}
                                            resetCodeGenerateOptions={() => setCodeGenerateOptions(null)}
                                        />
                                        : <></>
                                }
                            </div>
                        </div>

                        {(showExecResult && execResult) ?
                            <div
                                style={{
                                    whiteSpace: "pre-line",
                                    height: wideExecResult ? '550px' : '250px',
                                    flexGrow: 20,
                                    borderTop: '2px solid #888888',
                                    display: "flex",
                                    flexDirection: 'column',
                                    flexShrink: 0,
                                    overflow: "hidden"
                                }}
                            >
                                <ModalCloseIcon
                                    closeFunction={() => setShowExecResult(null)}
                                    title={'Очистить'}
                                    margin={'0 24px'}
                                    opacity={0.7}
                                    background={'black'}
                                />

                                <div style={{width: '100%', height: 0, position: 'relative'}}>
                                    <IconButton
                                        style={{
                                            position: 'absolute',
                                            right: 60,
                                            top: -8,
                                            background: 'black'
                                        }}
                                        className={'modal-close-icon'}
                                        onClick={() => setWideExecResult(prev => !prev)}
                                        title={`${wideExecResult ? 'Уменьшить' : 'Увеличить'}`}
                                    >
                                        {wideExecResult
                                            ? <KeyboardDoubleArrowDown
                                                style={{color: 'white'}} fontSize={'large'}
                                            />
                                            : <KeyboardDoubleArrowUp
                                                style={{color: 'white'}} fontSize={'large'}
                                            />
                                        }
                                    </IconButton>
                                </div>

                                <div className={'d-flex flex-row h-100'}>
                                    <div className={'d-flex flex-column exec-info'}
                                         style={{
                                             paddingLeft: 20,
                                             paddingRight: 20,
                                             paddingTop: 10,
                                             height: '100%',
                                             flexGrow: 1,
                                             minWidth: 250,
                                             width: (projectRunChecking ? 300 : 'unset'),
                                             flexShrink: (projectRunChecking ? 0 : 'unset')
                                         }}
                                    >
                                        {
                                            mavenExecInfo ? <>
                                                <Typography align={"center"} variant={'h5'}>Запуск проекта</Typography>
                                                <div className={`maven-exec-status maven-exec-status-${
                                                    Constants.PROJECT_RUN_STATUS_INFO[mavenExecInfo['status']].type}`}
                                                     style={{marginTop: 10, paddingTop: 10, paddingBottom: 12}}
                                                >
                                                    <Typography style={{whiteSpace: 'pre'}} variant={'h6'}>
                                                        <span
                                                            style={{
                                                                fontWeight: "lighter",
                                                                textDecoration: 'underline'
                                                            }}
                                                        >Статус процесса:</span><br style={{marginBottom: 3}}/>{
                                                        Constants.PROJECT_RUN_STATUS_INFO[mavenExecInfo['status']].name
                                                    }
                                                    </Typography>
                                                </div>
                                                {
                                                    mavenExecInfo['deployPort']
                                                        ? <><Typography align={'center'} style={{marginTop: 10}}
                                                                        variant={'h6'}>
                                                            Адрес развёрнутого проекта:<br/></Typography>
                                                            <Link
                                                                style={{fontSize: 22, margin: '0 auto', paddingTop: 3}}
                                                                to={`http://${mavenExecInfo['deployPort']}`}
                                                                target="_blank" rel="noopener noreferrer">
                                                                {mavenExecInfo['deployPort']}
                                                            </Link>
                                                        </> : <></>
                                                }
                                            </> : <>
                                                <Typography variant={'h5'}>Вывод программы:</Typography>
                                                <Typography style={{marginTop: 20}} variant={'h6'}>
                                                    Время работы: {execResult['executionTime']} мс
                                                </Typography>
                                                {
                                                    execResult['hasExitCode'] ?
                                                        <Typography style={{marginTop: 10}} variant={'h6'}>Код
                                                            завершения: <b
                                                                style={{
                                                                    color: execResult['exitCode'] === 0
                                                                        ? "#00aa00"
                                                                        : "#d20000"
                                                                }}>{execResult['exitCode']}</b></Typography> :
                                                        <Typography style={{marginTop: 10}} variant={'h6'}>
                                                            <b style={{color: "#d20000"}}>{execResult['status']}</b>
                                                        </Typography>
                                                }
                                            </>
                                        }
                                    </div>

                                    <div style={{
                                        fontSize: 18,
                                        paddingTop: 30,
                                        paddingLeft: 20,
                                        borderLeft: '1px solid #888888',
                                        overflow: 'scroll',
                                        whiteSpace: 'pre',
                                        flexGrow: 100,
                                        backgroundColor: "black",
                                        color: 'white'
                                    }}
                                         ref={execLogRef}
                                    >
                                        {!execResult ? null : execResult['output'].map((line, index) => {
                                            return <p
                                                key={`exec-line-${index + 1}`}
                                                className={'exec-result'}
                                                style={{margin: 0, marginBottom: -5}}
                                            >
                                                {line}
                                            </p>
                                        })}
                                        <br/>
                                    </div>
                                </div>
                            </div> : null}
                    </>

                </div>
            </div>
            <Modal
                open={openExecConfig}
                onClose={() => setOpenExecConfig(false)}
            >
                <div
                    className={'modal-center bg-white d-flex flex-column align-items-center text-center gap-4'}
                    style={{padding: '30px 40px'}}
                >
                    <h3>Конфигурация запуска</h3>

                    {
                        (projectInfo && projectInfo['projectBuildType'] === 'MAVEN')
                            ? <>
                                <TextField
                                    style={{width: '500px'}}
                                    size={'medium'}
                                    label={'groupId'}
                                    type={"text"}
                                    id={"groupId"}
                                    value={groupId}
                                    disabled
                                    sx={{
                                        '.MuiInputBase-input': {fontSize: '20px'},
                                    }}
                                />
                                <TextField
                                    style={{width: '500px'}}
                                    size={'medium'}
                                    label={'artifactId'}
                                    type={"text"}
                                    id={"artifactId"}
                                    disabled
                                    sx={{
                                        '.MuiInputBase-input': {fontSize: '20px'},
                                    }}
                                    value={projectInfo['name']}
                                />
                                <TextField
                                    style={{width: '500px'}}
                                    size={'medium'}
                                    label={'Внутренний порт приложения'}
                                    type={"text"}
                                    id={"artifactId"}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Help/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '.MuiInputBase-input': {fontSize: '20px'},
                                    }}
                                    value={applicationPort}
                                    onChange={event => setApplicationPort(event.target.value)}
                                />
                                <div className={'d-flex flex-row justify-content-around w-75'}>
                                    <Button
                                        variant={'contained'}
                                        type={'button'}
                                        sx={{background: '#259b12'}}
                                        disabled={processExecuting}
                                        onClick={() => {
                                            if (processExecuting) return;
                                            sendContentRequest();
                                            setOpenExecConfig(false);
                                        }}
                                    >
                                        Запустить
                                    </Button>
                                    <Button
                                        variant={'contained'}
                                        type={'button'}
                                        onClick={() => {
                                            setOpenExecConfig(false);
                                        }}
                                    >
                                        Сохранить и выйти
                                    </Button>
                                </div>
                            </>
                            : <>
                                <TextField
                                    style={{width: '500px'}}
                                    label={'Main class (например com.example.Main)'}
                                    type={"text"}
                                    id={"mainClass"}
                                    value={mainClassInput}
                                    onChange={event => setMainClassInput(event.target.value)}
                                />
                                <TextField
                                    style={{width: '500px'}}
                                    label={'Аргументы (через пробел)'}
                                    type={"text"}
                                    id={"args"}
                                    value={argsInput}
                                    onChange={event => setArgsInput(event.target.value)}
                                />
                                <div className={'d-flex flex-row-reverse justify-content-around w-75'}>
                                    <Button
                                        variant={'contained'}
                                        type={'button'}
                                        sx={{background: '#259b12'}}
                                        onClick={() => {
                                            saveConfigInput();
                                            setExecResult(null);
                                            setShowExecResult(false);
                                            sendContentRequest();
                                            setOpenExecConfig(false);
                                        }}
                                    >
                                        Запустить
                                    </Button>
                                    <Button
                                        variant={'contained'}
                                        type={'button'}
                                        onClick={() => {
                                            saveConfigInput();
                                            setOpenExecConfig(false);
                                        }}
                                    >
                                        Сохранить и выйти
                                    </Button>
                                </div>
                            </>
                    }
                </div>
            </Modal>


            {
                selectedFile ? <>
                    <Modal
                        open={historyOpen}
                        onClose={() => setHistoryOpen(false)}
                    >
                        <div
                            className={'w-75 modal-center bg-white'}
                            style={{padding: '30px 40px', maxHeight: '90vh'}}
                        >
                            <div>
                                <ModalCloseIcon closeFunction={() => setHistoryOpen(false)}/>
                                <div className={'bg-white p-3 d-flex flex-column gap-4'}
                                     style={{overflowY: "scroll", maxHeight: 800}}>
                                    <h1 style={{textAlign: "center"}}>История изменений</h1>
                                    <DiffList
                                        canRestore={(projectRole && !['COMMENTER', 'WATCHER'].includes(projectRole['projectRole']))}
                                        projectUUID={projectUUID}
                                        fileId={selectedFile['id']}
                                        restoreHandler={newCode => {
                                            codeGenerateHandler({
                                                'replace': true,
                                                'source': 'diff',
                                                'code': newCode})
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal>


                    <Modal
                        open={openCodeGen}
                        onClose={() => setOpenCodeGen(false)}
                    >
                        <div
                            className={'w-65 modal-center bg-white'}
                            style={{padding: '30px 40px', maxHeight: '90vh'}}
                        >
                            <div>
                                <ModalCloseIcon
                                    closeFunction={() => setOpenCodeGen(false)}
                                    margin={'0 36px'}
                                />
                                <div className={'bg-white p-3 d-flex flex-column align-items-center gap-2'}
                                     style={{overflowY: "scroll", maxHeight: 800}}>
                                    <CodeGenerator
                                        fileName={selectedFile['path']}
                                        codeGenerateHandler={codeGenerateHandler}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal>
                </> : <></>
            }
        </>
    );
};

function codeGenAvailable(fileName) {
    return (
        fileName.endsWith('.java')
            // || fileName.endsWith('/pom.xml')
            // || fileName === 'pom.xml'
    );
}

function filesToTree(files) {
    let tree = {};
    files.forEach(file => {
        let members = file.path.split('/');
        let length = members.length;
        let current = tree;
        for (let i = 0; i < length; i++) {
            let nestedObj = current[members[i]];
            if (!nestedObj) nestedObj = {
                'file/name': members[i],
                'file/isSource': (i === 0)
            };
            if (i + 1 === length) {
                nestedObj['file/path'] = file.path;
                const isFolder = file['isFolder'];
                nestedObj['file/id'] = (isFolder ? 'folder' : 'file') + file.id;
                nestedObj['file/isFolder'] = isFolder;
                if (!isFolder) nestedObj['file/contentId'] = file.contentId;
            }
            current[members[i]] = nestedObj;
            current = nestedObj;
        }
    });
    return tree;
}

function equalsArrays(array1, array2) {
    return (array1.length === array2.length && array1.every((value, index) => value === array2[index]));
}

/*
{
    'com': {
        name: 'com'
        isFolder: true,
        id: 34243,
        'kvitka': {
            name: 'kvitka'
            isFolder: true,
            id: 34243,
            'Main.java': {
                name: 'Main.java'
                isFolder: false,
                id: 8364
                contentId: 'jkh4-53gh-j53j4k-34gkh'
            },
            'Test.java': {
                name: 'Test.java'
                isFolder: false,
                id: 8364
                contentId: 'jkh4-53gh-j53j4k-34gkh'
            }
        },
        'test': {
            name: 'test'
            isFolder: true,
            id: 34243,
            'A.java': {
                name: 'A.java'
                isFolder: false,
                id: 8364
                contentId: 'jkh4-53gh-j53j4k-34gkh'
            }
        }
    }
}
 */