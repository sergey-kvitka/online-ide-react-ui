// noinspection JSUnresolvedFunction,JSCheckFunctionSignatures

import {useCallback, useEffect, useState} from 'react';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {io} from 'socket.io-client';
import {useParams} from "react-router-dom";

const SAVE_INTERVAL_MS = 500;

export default function FileEditor() {

    const {file_uuid: documentId} = useParams();

    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();

    useEffect(() => { // ! connecting to the socket
        const sct = io('http://localhost:3030');
        setSocket(sct);
        return () => {
            sct.disconnect();
        };
    }, []);


    useEffect(() => { // ! loading content and enabling quill
        if (socket == null || quill == null) return;
        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable();
        });

        socket.emit('get-document', documentId);
    }, [socket, quill, documentId]);


    useEffect(() => { // ! interval saving data
        if (socket == null || quill == null) return;

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents());
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval)
        };
    }, [socket, quill]);


    useEffect(() => { // ! receiving quill changes from socket
        if (socket == null || quill == null) return;
        const handler = delta => {
            quill.updateContents(delta);
        }

        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        };
    }, [socket, quill]);


    useEffect(() => { // ! emitting quill changes via socket
        if (socket == null || quill == null) return;
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
        }

        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        };
    }, [socket, quill]);


    const wrapperRef = useCallback((wrapper) => { // ! init quill to render it
        if (wrapper == null) return;
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);
        const ql = new Quill(editor, {
            theme: "snow",
            modules: {
                toolbar: false
            }
        });
        ql.disable();
        setQuill(ql);
    }, []);

    return (
        <div className={'d-flex flex-column editor-container'}>
            <div style={{height: '100%'}}>
                <div className={'editor'} ref={wrapperRef}></div>
            </div>
        </div>
    );
};
