// noinspection JSCheckFunctionSignatures,JSUnresolvedFunction

import {useEffect, useState} from 'react';
import {Navigate, useNavigate, useParams} from "react-router-dom";
import Methods from "../../util/Methods";
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";
import {Stack} from "react-bootstrap";
import FileEditor from "./FileEditor";
import FileListElement from "./FileListElement";
import {Button, IconButton, Link, Modal, TextField} from "@mui/material";
import {io} from "socket.io-client";
import {Add, DeleteForever, PlayArrow, Settings} from "@mui/icons-material";
import {v4 as uuid} from 'uuid';

export default function Workspace() {

    const {
        project_uuid: projectUUID,
        file_uuid: documentId
    } = useParams();

    const [socket, setSocket] = useState();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [projectInfo, setProjectInfo] = useState(null);

    const [fileElements, setFileElements] = useState([]);
    const [fileIds, setFileIds] = useState([]);

    const [execResult, setExecResult] = useState(null);

    const [openExecConfig, setOpenExecConfig] = useState(false);
    const [openFileCreateDialog, setOpenFileCreateDialog] = useState(false);

    const [mainClass, setMainClass] = useState('com.kvitka.Main');
    const [args, setArgs] = useState('');

    const [newFilePath, setNewFilePath] = useState('');

    const [ok, setOk] = useState(true);

    const navigate = useNavigate();

    function getFiles() {
        fetch(Methods.getIdeApiURL(`file/${projectUUID}/files`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(files => {
                setFiles(files);
            });
    }

    function getProjectInfo() {
        fetch(Methods.getIdeApiURL(`project/${projectUUID}/info`), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(projectInfo => {
                setProjectInfo(projectInfo);
            });
    }

    useEffect(() => {
        getFiles();
        getProjectInfo();
    }, []);

    useEffect(() => {
        setFileElements(files.map(file => {
            const contentId = file['contentId'];
            let selected = false;
            if (!selected && contentId === documentId) {
                setSelectedFile(file);
                selected = true;
            }
            return <Link
                className={`no-style-link file${selected ? ` selected-file` : ''}`}
                href={`/project/workspace/${projectUUID}/${contentId}`}
                underline={"none"}
                key={file['path']}
            >
                <FileListElement file={file}/>
            </Link>;
        }));
        setFileIds(files.map(file => file['contentId']));
    }, [files]);

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
        if (!socket || !projectUUID || !files) return;
        const responseEvent = `project-content-response-${projectUUID}`;
        const responseHandler = documents => {
            documents = [...documents].map(doc => {
                const file = files.find(file => file['contentId'] === doc['id']);
                return {...doc, 'path': (file['path']).replaceAll('/', '\\\\')};
            });
            sendExecRequest(projectUUID, documents, mainClass, args.split('\n'));
        };

        socket.on(responseEvent, responseHandler);

        return () => {
            socket.off(responseEvent, responseHandler);
        }
    }, [socket, projectUUID, files, mainClass, args]);

    const sendContentRequest = () => {
        socket.emit(`project-content-request-${projectUUID}`, fileIds);
    }

    function sendExecRequest(projectId, files, mainClass, args) {
        const bodyStr = JSON.stringify({
            'projectId': projectId,
            'mainClass': mainClass,
            'files': files,
            'args': args
        });
        fetch('http://localhost:8123/jar-exec/api/exec', {
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
                console.log(result);
                setExecResult(result);
            });
    }

    function arrayToText(arr) {
        if (!arr) return null;
        return [...arr].join('\n');
    }

    function createFile() {
        const contentId = uuid();
        console.log(`new uuid: ${contentId}`);
        fetch(Methods.getIdeApiURL('file/create'), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'PUT',
            body: JSON.stringify({
                'projectUUID': projectUUID,
                'contentId': contentId,
                'path': newFilePath
            })
        }).then(response => {
            if (!(response.status === 200)) return Promise.reject(response);
            window.location.reload();
            // navigate(`/project/workspace/${projectUUID}/${contentId}`, true);
        })
    }

    return (ok ? <>
            <div className={'d-flex flex-row workspace-page'}>
                <Stack
                    direction={'vertical'}
                    gap={3}
                    className={'border border-dark'}
                    style={{flex: 'none', maxWidth: '25%', minWidth: '12%', overflow: 'hidden'}}
                >
                    <div className={'d-flex flex-row justify-content-center mt-2'} style={{marginBottom: -5}}>
                        <IconButton
                            onClick={() => setOpenFileCreateDialog(true)}
                            style={{background: '#3c7ad9', padding: 3, width: 'fit-content'}}
                        >
                            <Add style={{color: 'white'}}/>
                        </IconButton>
                        <IconButton
                            onClick={() => {}}
                            style={{background: '#ff0014', padding: 3, width: 'fit-content', marginLeft: 40}}
                        >
                            <DeleteForever style={{color: 'white'}}/>
                        </IconButton>
                    </div>
                    {fileElements}

                </Stack>
                <div
                    className={'d-flex flex-column border border-dark'}
                    style={{flex: 2, height: '100%', maxHeight: '100%', overflow: 'hidden'}}
                >
                    {selectedFile ? <>
                        <div className={'editor-panel'}>
                            <h5 className={'flex-lg-grow-1'}>{selectedFile['path']}</h5>
                            <IconButton
                                onClick={() => setOpenExecConfig(true)}
                                style={{background: '#21252b', padding: 3, borderRadius: 7, margin: 5}}
                            >
                                <Settings style={{color: '#29c468'}}/>
                            </IconButton>
                            <IconButton
                                onClick={() => {
                                    setExecResult(null);
                                    sendContentRequest();
                                }}
                                style={{background: '#21252b', padding: 3, borderRadius: 7, margin: 5}}
                            >
                                <PlayArrow style={{color: '#29c468'}}/>
                            </IconButton>
                        </div>
                        <FileEditor/>
                        {execResult ? <div style={{
                            whiteSpace: "pre-line",
                            height: '300px',
                            overflowY: 'scroll'
                        }}>
                            {arrayToText(execResult ? execResult['output'] : null)}
                        </div> : null}
                    </> : null}
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

                    <TextField
                        style={{width: '500px'}}
                        label={'Main class (например com.project.Main)'}
                        type={"text"}
                        id={"mainClass"}
                        value={mainClass}
                        onChange={event => setMainClass(event.target.value)}
                    />
                    <TextField
                        style={{width: '500px'}}
                        label={'Аргументы (через пробел)'}
                        type={"text"}
                        id={"args"}
                        value={args}
                        onChange={event => setArgs(event.target.value)}
                    />
                    <div className={'d-flex flex-row justify-content-around w-75'}>
                        <Button
                            variant={'contained'}
                            type={'button'}
                            sx={{background: '#259b12'}}
                            onClick={() => {
                                setExecResult(null);
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

                </div>
            </Modal>
            <Modal
                open={openFileCreateDialog}
                onClose={() => setOpenFileCreateDialog(false)}
            >
                <div
                    className={'modal-center bg-white d-flex flex-column align-items-center text-center gap-4'}
                    style={{padding: '30px 40px'}}
                >
                    <h3>Создание файла</h3>

                    <TextField
                        style={{width: '500px'}}
                        label={'Путь файла в проекте (например "com/project/Service.java")'}
                        type={"text"}
                        id={"newFilePath"}
                        value={newFilePath}
                        onChange={event => setNewFilePath(event.target.value)}
                    />
                    <Button
                        variant={'contained'}
                        type={'button'}
                        onClick={() => createFile()}
                    >
                        Создать файл
                    </Button>
                </div>
            </Modal>
        </> : <Navigate to={'/projects'}/>
    );
};
