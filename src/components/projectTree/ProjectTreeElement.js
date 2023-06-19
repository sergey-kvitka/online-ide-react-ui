// noinspection JSValidateTypes

import {TabContext, TabList, TabPanel, TreeItem} from "@mui/lab";
import IconContainer from "./IconContainer";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Modal,
    Snackbar,
    Tab,
    TextField,
    Typography
} from "@mui/material";
import {Add, ChevronRight, Delete, DriveFileRenameOutlineRounded} from "@mui/icons-material";
import {useNavigate, useParams} from "react-router-dom";
import ModalCloseIcon from "../ModalCloseIcon";
import {useState} from "react";
import Methods from "../../util/Methods";
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";
import {v4 as uuid} from 'uuid';

export default function ProjectTreeElement({
                                               tree,
                                               projectInfo,
                                               childrenGetter,
                                               icons,
                                               documentIdSetter,
                                               selected,
                                               fileUpdateHandler,
                                               projectRole
                                           }) {

    const {
        project_uuid: projectUUID
    } = useParams();

    const id = tree['file/id'];
    const path = `${tree['file/path']}`;
    const fileName = `${tree['file/name']}`;
    const isFolder = tree['file/isFolder'];
    const isSource = tree['file/isSource'];
    const contentId = tree['file/contentId'];

    const navigate = useNavigate();

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [addFileOpen, setAddFileOpen] = useState(false);
    const [renameFileOpen, setRenameFileOpen] = useState(false);
    const [deleteFileOpen, setDeleteFileOpen] = useState(false);

    const [addFileTab, setAddFileTab] = useState('file');

    const [newFileName, setNewFileName] = useState('');
    const [newFileError, setNewFileError] = useState(false);
    const [newFileHelp, setNewFileHelp] = useState('');

    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderError, setNewFolderError] = useState(false);
    const [newFolderHelp, setNewFolderHelp] = useState('');

    const [renameFileName, setRenameFileName] = useState(fileName);
    const [renameFileError, setRenameFileError] = useState(false);
    const [renameFileHelp, setRenameFileHelp] = useState('');

    const [renameFolderName, setRenameFolderName] = useState(fileName);
    const [renameFolderError, setRenameFolderError] = useState(false);
    const [renameFolderHelp, setRenameFolderHelp] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');

    const [uploadFileName, setUploadFileName] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadFileSaving, setUploadFileSaving] = useState(false);

    function createFile(type) {
        if (!['file', 'folder'].includes(type)) return;
        const isFile = type === 'file';
        if (!validate(type, 'create')) return;
        if (isFile && uploadFile) {
            createFileByUpload();
            return;
        }

        let name;
        if (isFile) name = newFileName;
        else if (type === 'folder') name = newFolderName;
        name = name.trim();
        //if (isFile && !name.endsWith('.java')) name += '.java';

        let body = {
            projectUUID: projectInfo['uuid'],
            path: `${path}/${name}`
        };
        if (isFile) body.contentId = uuid();

        fetch(Methods.getIdeApiURL(`file/create${!isFile ? 'Folder' : ''}`), {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            body: JSON.stringify(body)
        }).then(response => {
            return (response.status === 200)
                ? response.json()
                : Promise.reject(response);
        })
            .then(() => {
                setToastMessage(`${
                    isFile ? 'Файл' : 'Папка'
                } успешно создан${
                    isFile ? '' : 'а'
                }!`);
                setToastSeverity('success');
                setShowToast(true);
                fileUpdateHandler();
                setAddFileOpen(false);
                if (isFile) setNewFileName('');
                else setNewFolderName('');
                documentIdSetter(body.contentId);
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        const message = error['message'];
                        if (isFile) {
                            setNewFileError(true);
                            setNewFileHelp(message);
                        } else {
                            setNewFolderError(true);
                            setNewFolderHelp(message);
                        }
                    });
            });
    }

    function renameFile(type) {
        if (!['file', 'folder'].includes(type)) return;
        if (!validate(type, 'rename')) return;
        const isFile = type === 'file';

        let name;
        if (isFile) name = renameFileName;
        else if (type === 'folder') name = renameFolderName;
        name = name.trim();
        // if (isFile && !name.endsWith('.java')) name += '.java';

        const newPath = `${getPathExceptName(path)}/${name}`;

        if (newPath === path) {
            setRenameFileOpen(false);
            return;
        }

        fetch(Methods.getIdeApiURL(`file/edit${isFile ? 'File' : 'Folder'}/${clearId(id)}`), {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            body: JSON.stringify({path: newPath})
        }).then(response => {
            return (response.status === 200)
                ? response.json()
                : Promise.reject(response);
        })
            .then(() => {
                setToastMessage(`${
                    isFile ? 'Файл' : 'Папка'
                } успешно переименован${
                    isFile ? '' : 'а'
                }!`);
                setToastSeverity('success');
                setShowToast(true);
                fileUpdateHandler();
                setRenameFileOpen(false);
                if (isFile) setRenameFileName(name.slice(0, -5));
                else setRenameFolderName(name);
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        const message = error['message'];
                        if (isFile) {
                            setRenameFileError(true);
                            setRenameFileHelp(message);
                        } else {
                            setRenameFolderError(true);
                            setRenameFolderHelp(message);
                        }
                    });
            });
    }

    function validate(type, action) {
        if (!['file', 'folder'].includes(type) || !['create', 'rename'].includes(action)) return false;
        let value;
        if (type === 'file' && action === 'create') value = newFileName;
        else if (type === 'folder' && action === 'create') value = newFolderName;
        else if (type === 'file' && action === 'rename') value = renameFileName;
        else if (type === 'folder' && action === 'rename') value = renameFolderName;
        value = value.trim();
        const isJavaFile = (value.endsWith('.java'));
        let javaFileName;
        if (isJavaFile) javaFileName = value.slice(0, -5);
        const ofFile = {'file': 'файла', 'folder': 'папки'}
        let help = '';

        if (value === '')
            help = `Название ${ofFile[type]} не может быть пустым`;
        else if (/[\\/:*?"<>|]/.test(value))
            help = `Название ${ofFile['type']} не должно содержать следующих знаков: \\ / : * ? " < > |`;
        else if (type === 'file' && isJavaFile && !(/^[a-zA-Zа-яА-ЯёЁ0-9_$]{1,100}$/.test(javaFileName)))
            help = 'Название Java-файла может состоять только из букв латиницы и кириллицы, цифр и символов _ и $';

        let error = (help !== '');
        if (type === 'file' && action === 'create') {
            setNewFileError(error);
            setNewFileHelp(help);
        } else if (type === 'folder' && action === 'create') {
            setNewFolderError(error);
            setNewFolderHelp(help);
        } else if (type === 'file' && action === 'rename') {
            setRenameFileError(error);
            setRenameFileHelp(help);
        } else if (type === 'folder' && action === 'rename') {
            setRenameFolderError(error);
            setRenameFolderHelp(help);
        }
        return !error;
    }

    function deleteFile() {
        fetch(Methods.getIdeApiURL(`file/delete${isFolder ? 'Folder' : 'File'}/${clearId(id)}`), {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            body: '{}'
        })
            .then(() => {
                setToastMessage(`${
                    !isFolder ? 'Файл' : 'Папка'
                } успешно ${
                    !isFolder ? 'удалён' : 'удалена'
                }!`);
                setToastSeverity('success');
                setShowToast(true);
                fileUpdateHandler();
                setDeleteFileOpen(false);
            });
    }

    const handleFileUpload = (e) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        const {name} = file;
        setUploadFileName(name);
        setUploadFile(file);
        setNewFileName(name);
    };

    const handleClearUpload = () => {
        setUploadFileName(null);
        setUploadFile(null);
        setNewFileName('');
    };

    const handleDownload = () => {
        fetch(Methods.getIdeApiURL(`file/getMultipartFile/${contentId}`), {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(response);
            })
            .then(response => {
                const link = document.createElement('a');
                link.download = getShortName(path);
                const blob = new Blob([response['content']], {type: 'text/plain'});
                link.href = window.URL.createObjectURL(blob);
                link.click();
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        const message = error['message'];
                        setToastMessage(message);
                        setToastSeverity('error');
                    });
            });
    };

    const createFileByUpload = () => {
        const formData = new FormData();
        // noinspection JSCheckFunctionSignatures
        formData.append("file", uploadFile);
        formData.append("filepath", path + '/' + newFileName);

        setUploadFileSaving(true);
        fetch(Methods.getIdeApiURL(`file/createFileByUpload/${projectUUID}`), {
            method: 'PUT',
            headers: {'Authorization': jwt},
            body: formData
        }).then(response => {
            return (response.status === 200)
                ? response.json()
                : Promise.reject(response);
        })
            .then(response => {
                setToastMessage(`Файл успешно создан!`);
                setToastSeverity('success');
                setShowToast(true);
                fileUpdateHandler();
                setAddFileOpen(false);
                handleClearUpload();
                documentIdSetter(response['contentId']);
            })
            .catch(response => {
                return response.json()
                    .then(error => {
                        const message = error['message'];
                        setNewFileError(true);
                        setNewFileHelp(message);
                    });
            })
            .finally(() => {
                setUploadFileSaving(false);
            });
    }

    return (<>
        <div className={'position-relative'}>
            {['COMMENTER', 'WATCHER'].includes(projectRole) ? <></> : <div
                className={'position-absolute'}
                style={{
                    right: 0,
                    zIndex: 2,
                    height: 36,
                    width: 105,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start',
                    padding: '0 3px'
                }}
            >
                {!isFolder ? <></> :
                    <IconButton
                        size={'small'}
                        title={`Создать файл в папке ${fileName}`}
                        onClick={() => {
                            setNewFileHelp('');
                            setNewFolderHelp('');
                            setNewFileError(false);
                            setNewFolderError(false);
                            setAddFileOpen(true);
                        }}
                    >
                        <Add
                            style={{fontSize: 26}}
                            color={'success'}
                        />
                    </IconButton>
                }
                <IconButton
                    size={'small'}
                    title={`Переименовать ${isFolder ? 'папку' : 'файл'} ${fileName}`}
                    onClick={() => {
                        setRenameFileHelp('');
                        setRenameFolderHelp('');
                        setRenameFileError(false);
                        setRenameFolderError(false);
                        setRenameFileOpen(true);
                    }}
                >
                    <DriveFileRenameOutlineRounded
                        fontSize={'small'}
                        style={{color: '#ffb700'}}
                    />
                </IconButton>

                <IconButton
                    size={'small'}
                    title={`Удалить ${isFolder ? 'папку' : 'файл'} ${fileName}`}
                    onClick={() => setDeleteFileOpen(true)}
                >
                    <Delete
                        fontSize={'small'}
                        color={'error'}
                    />
                </IconButton>


            </div>}
            <TreeItem
                nodeId={`${id}`}
                endIcon={
                    <IconContainer paddingLeft={isFolder ? 0 : 7}>
                        {isFolder ? <ChevronRight className={'opacity-0'}/> : null}
                        {icons[isFolder ? 'folder' : 'java']}
                    </IconContainer>
                }
                label={
                    <div
                        className={`${((contentId) && selected === contentId) ? 'selected-file' : ''}`}
                        style={{
                            margin: '1px 0',
                            paddingRight: (['COMMENTER', 'WATCHER'].includes(projectRole) ? 0 : 100),
                            whiteSpace: "nowrap"
                        }}
                    >
                        {fileName}
                    </div>
                }
                onClick={() => {
                    if (isFolder) return;
                    if (documentIdSetter) documentIdSetter(contentId);
                    navigate(`/project/workspace/${projectInfo['uuid']}/${contentId}`);
                }}
            >
                {childrenGetter(tree, projectInfo)}
            </TreeItem>
        </div>

        {isFolder ? <Modal // ? CREATE FILE
            open={addFileOpen}
            onClose={() => setAddFileOpen(false)}
        >
            <div className={'modal-center'} style={{minWidth: 700}}>
                <ModalCloseIcon closeFunction={() => setAddFileOpen(false)}/>
                <div className={'bg-white p-4 d-flex flex-row justify-content-center gap-4'}>
                    <Box sx={{width: '100%', m: 2, mb: 0, typography: 'body1'}}>
                        <TabContext value={addFileTab}>
                            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                <TabList onChange={(e, newValue) => setAddFileTab(newValue)}>
                                    <Tab style={{fontSize: 18}} label="Создание файла" value={'file'}/>
                                    <Tab style={{fontSize: 18}} label="Создание папки" value={'folder'}/>
                                </TabList>
                            </Box>
                            <TabPanel value={'file'} className={'pb-0 pt-5'}>
                                <div style={{display: 'flex'}} className={'flex-column justify-content-center gap-2'}>
                                    <TextField
                                        fullWidth
                                        className={'input-underline'}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">{path + '/'}</InputAdornment>
                                            //, endAdornment: <InputAdornment position="end">.java</InputAdornment>
                                        }}
                                        label="Путь файла в проекте"
                                        value={newFileName}
                                        onChange={event => setNewFileName(event.target.value)}
                                        error={newFileError}
                                        helperText={newFileHelp}
                                    />
                                    <Typography variant={'h6'} textAlign={"center"} style={{color: '#888888'}}>
                                        или
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        style={{background: "#08086e"}}
                                    >
                                        Загрузить файл
                                        <input
                                            type="file"
                                            hidden
                                            onChange={handleFileUpload}
                                        />
                                    </Button>
                                    {
                                        uploadFileName ?
                                            <Typography style={{marginBottom: -10}} variant={'body1'}
                                                        textAlign={"center"}>
                                                <b style={{color: '#0a5e10'}}>Файл <u>{uploadFileName}</u> загружен{' '}
                                                    <span
                                                        title={'Удалить загруженный файл'}
                                                        style={{
                                                            fontSize: 14,
                                                            cursor: "pointer"
                                                        }}
                                                        onClick={handleClearUpload}
                                                    >❌</span>
                                                </b>
                                            </Typography> : <></>
                                    }

                                    <div
                                        className={'d-flex flex-row align-items-center'}
                                        style={{marginTop: 35, height: 42}}
                                    >
                                        <Button
                                            variant={"contained"}
                                            size={"large"}
                                            style={{flexGrow: 10}}
                                            onClick={() => createFile('file')}
                                        >Создать файл</Button>
                                        {uploadFileSaving
                                            ? <CircularProgress
                                                style={{marginLeft: 15}}
                                            />
                                            : null}
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel value={'folder'}>
                                <div style={{display: 'flex'}} className={'flex-column justify-content-center gap-5'}>
                                    <TextField
                                        fullWidth
                                        className={'input-underline'}
                                        InputProps={{
                                            startAdornment:
                                                <InputAdornment position="start">{path + '/'}</InputAdornment>
                                        }}
                                        label="Путь папки в проекте"
                                        value={newFolderName}
                                        onChange={event => setNewFolderName(event.target.value)}
                                        error={newFolderError}
                                        helperText={newFolderHelp}
                                    />
                                    <Button
                                        variant={"contained"}
                                        size={"large"}
                                        fullWidth={false}
                                        onClick={() => createFile('folder')}
                                    >Создать папку</Button>
                                </div>
                            </TabPanel>
                        </TabContext>
                    </Box>
                </div>
            </div>
        </Modal> : <></>}

        <Modal // ? RENAME FILE
            open={renameFileOpen}
            onClose={() => setRenameFileOpen(false)}
        >
            <div className={'modal-center'} style={{minWidth: 700}}>
                <ModalCloseIcon closeFunction={() => setRenameFileOpen(false)}/>
                <div className={'bg-white p-4 d-flex flex-column align-items-center gap-5'}>
                    <h1 style={{textAlign: "center"}}>Переименование {isFolder ? 'папки' : 'файла'}</h1>
                    <TextField
                        fullWidth
                        className={'input-underline'}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start">{getPathExceptName(path) + '/'}</InputAdornment>
                            //,endAdornment: isFolder ? null : <InputAdornment position="end">.java</InputAdornment>
                        }}
                        label="Путь папки в проекте"
                        value={isFolder ? renameFolderName : renameFileName}
                        onChange={event => {
                            const value = event.target.value;
                            if (isFolder) setRenameFolderName(value);
                            else setRenameFileName(value);
                        }}
                        error={isFolder ? renameFolderError : renameFileError}
                        helperText={isFolder ? renameFolderHelp : renameFileHelp}
                    />
                    <div className={'d-flex w-75 gap-lg-4 flex-row-reverse justify-content-around align-items-center'}>
                        <Button
                            style={{flexGrow: 2}}
                            variant={"contained"}
                            size={"large"}
                            fullWidth={false}
                            onClick={() => renameFile(isFolder ? 'folder' : 'file')}
                        >Переименовать {isFolder ? 'папку' : 'файл'}</Button>
                        {!isFolder ? <Button
                            style={{flexGrow: 2}}
                            variant={"contained"}
                            color={'success'}
                            size={"large"}
                            fullWidth={false}
                            onClick={handleDownload}
                        >Скачать файл</Button> : null}
                    </div>
                </div>
            </div>
        </Modal>

        {isSource ? <></> :
            <Modal // ? DELETE FILE
                open={deleteFileOpen}
                onClose={() => setDeleteFileOpen(false)}
            >
                <div className={'modal-center'}>
                    <ModalCloseIcon closeFunction={() => setDeleteFileOpen(false)}/>
                    <div className={'bg-white p-4 d-flex flex-column align-items-center gap-4'}>
                        <h1 style={{textAlign: "center"}}>Удаление {isFolder ? 'папки' : 'файла'}</h1>
                        <p style={{textAlign: "center", fontSize: 28}}>
                            Вы действительно хотите удалить {isFolder ? 'папку' : 'файл'} <b>{fileName}</b>?{
                            isFolder ? <><br/>Все файлы и папки внутри будут также удалены!</> : ''
                        }</p>
                        <div
                            className={'d-flex flex-row justify-content-center gap-5 mt-1'}
                            style={{marginBottom: 10}}
                        >
                            <Button
                                variant={'contained'}
                                color={"info"}
                                size={'large'}
                                onClick={() => setDeleteFileOpen(false)}
                            >
                                Отменить удаление
                            </Button>
                            <Button
                                variant={'contained'}
                                color={"error"}
                                size={'large'}
                                onClick={() => {
                                    deleteFile();
                                }}
                            >
                                Удалить
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>}

        <Snackbar // * universal
            open={showToast}
            autoHideDuration={6000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                setShowToast(false);
            }}
        >
            <Alert
                severity={toastSeverity}
                className={'d-flex flex-row align-items-center'}
                sx={{width: '100%'}}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') return;
                    setShowToast(false);
                }}
            >
                <Typography textAlign={'center'} variant={'h6'}>{toastMessage}</Typography>
            </Alert>
        </Snackbar>
    </>);
};

function clearId(id) {
    if (id.includes('file')) return id.replace('file', '');
    if (id.includes('folder')) return id.replace('folder', '');
}

function getShortName(path) {
    return [...path.split('/')].slice(-1)[0];
}

function getPathExceptName(path) {
    return [...path.split('/')].slice(0, -1).join('/');
}