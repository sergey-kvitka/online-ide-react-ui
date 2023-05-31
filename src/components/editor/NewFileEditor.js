// noinspection JSUnresolvedFunction

import React, {useEffect, useState} from 'react';
import MonacoEditor from "react-monaco-editor/lib/editor";
import {io} from "socket.io-client";
import Methods from "../../util/Methods";
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";
import {CircularProgress} from "@mui/material";

const SAVE_INTERVAL_MS = 500;

export default function NewFileEditor({
                                          documentId,
                                          projectUUID,
                                          projectRole,
                                          filePath,
                                          pathHandler,
                                          codeGenerateOptions,
                                          resetCodeGenerateOptions
                                      }) {

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [socket, setSocket] = useState(null);

    const [code, setCode] = useState(``);
    const [codeUpdated, setCodeUpdated] = useState(0);
    const [codeLoaded, setCodeLoaded] = useState(false);
    const [readOnly, setReadOnly] = useState(true);

    const [codeBefore, setCodeBefore] = useState(null);
    const [dateBefore, setDateBefore] = useState(null);

    function editorDidMount(editor, _) {
        editor.focus();
    }

    useEffect(() => {
        if (!codeGenerateOptions || !codeLoaded) return;
        if (codeGenerateOptions['replace']) setCode(codeGenerateOptions['code']);
        else setCode(prev => prev + codeGenerateOptions['code']);
        setCodeUpdated(prev => prev + 1);
        resetCodeGenerateOptions();
    }, [codeGenerateOptions, codeLoaded]);

    useEffect(() => pathHandler(filePath), []);

    useEffect(() => {
        if (codeUpdated === 0 || !socket || !codeLoaded || !documentId) return;
        // console.log('sending changes');
        socket.emit('send-changes', code);
    }, [codeUpdated, socket, codeLoaded, documentId]);

    useEffect(() => { // ! connecting to the socket
        if (socket) return;
        const sct = io('http://localhost:3030'); // todo hardcoded URL
        setSocket(sct);
        console.log('connected to the socket');
        return () => {
            sct.removeAllListeners();
            sct.disconnect();
        };
    }, []);

    useEffect(() => { // ! receiving changes from socket
        if (!socket || !codeLoaded || (codeBefore === null) || !dateBefore) return;
        const handler = newValue => {
            // console.log('receiving changes');
            let x = (code === codeBefore);
            saveDifference(codeBefore, code, dateBefore, projectUUID, documentId);
            setCode(newValue);
            saveBefore(newValue);
        };
        socket.on('receive-changes', handler);
        return () => socket.off('receive-changes', handler);
    }, [socket, code, codeBefore, dateBefore, codeLoaded]);

    useEffect(() => { // ! interval saving data
        if (!socket || !codeLoaded) return;
        const interval = setInterval(() => {
            socket.emit('save-document', code);
        }, SAVE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [socket, codeLoaded, code, documentId]);

    useEffect(() => { // ! loading content and enabling editor
        if (!socket) return;
        socket.once('load-document', document => {
            setCode(document);
            if (!['COMMENTER', 'WATCHER'].includes(projectRole)) setReadOnly(false);
            setCodeLoaded(true);
            saveBefore(document);
        });
        socket.emit('get-document', documentId);
        return () => socket.off('get-document', documentId);
    }, [socket, documentId]);

    useEffect(() => {
        if (!codeLoaded || (codeBefore === null) || !dateBefore) return;
        const handler = () => {
            saveDifference(codeBefore, code, dateBefore, projectUUID, documentId);
        };
        window.addEventListener('unload', handler);
        window.addEventListener('beforeunload', handler);

        return () => {
            window.removeEventListener('unload', handler);
            window.removeEventListener('beforeunload', handler);
        };
    }, [code, codeBefore, dateBefore, codeLoaded]);

    function saveBefore(code) {
        // console.log('save before');
        setCodeBefore(code.slice());
        setDateBefore(new Date());
    }

    function saveDifference(codeBefore, codeAfter, dateBefore, projectUUID, documentId) {
        // console.log('trying save after');
        if (codeAfter === codeBefore) {
            return;
        }
        // console.log('continue save after');
        fetch(Methods.getIdeApiURL('codeDiff/save'), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'PUT',
            body: JSON.stringify({
                'codeBefore': codeBefore,
                'codeAfter': codeAfter,
                'dateBefore': dateBefore.toISOString(),
                'dateAfter': new Date().toISOString(),
                'projectUUID': projectUUID,
                'fileContentId': documentId
            })
        }).then(() => {
        });
    }

    return codeLoaded ? <MonacoEditor
        value={code}
        language={languageFromExtension(getExtension(filePath))}
        options={{
            selectOnLineNumbers: true,
            fontSize: 18,
            readOnly: readOnly,
        }}
        editorDidMount={editorDidMount}
        onChange={(newValue, _) => {
            setCodeUpdated(prev => prev + 1);
            setCode(newValue);
        }}
    /> : <div style={{width: '100%', display: "flex", justifyContent: "center", marginTop: 30}}>
        <CircularProgress size={100}/>
    </div>;
};

const getExtension = path => {
    return path.split('.').slice(-1)[0];
}

const languageFromExtension = extension => {
    const _extension = extension.toLowerCase();
    return {
        'java': 'java',
        'xml': 'xml'
    }[_extension];
}