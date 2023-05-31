import {useCallback, useEffect, useState} from 'react'
import * as monaco from 'monaco-editor-core';
import TreeView from '@mui/lab/TreeView';
import {TreeItem} from "@mui/lab";
import {
    ChevronRight,
    ExpandMore,
    Folder,
    JavascriptOutlined,
    JavascriptRounded,
    JavascriptSharp, Source
} from "@mui/icons-material";

export default function TestComponent() {

    const [editorDiv1, setEditorDiv1] = useState();
    const [editorDiv2, setEditorDiv2] = useState();

    const [editor1, setEditor1] = useState(null);
    const [editor2, setEditor2] = useState(null);

    const ref1 = useCallback(wrapper => {
        setEditorDiv1(wrapper);
    }, []);

    const ref2 = useCallback(wrapper => {
        setEditorDiv2(wrapper);
    }, []);

    useEffect(() => {
        if (!editorDiv1 || !editor2) return;
        const editor = monaco.editor.create(editorDiv1, {
            language: 'java',
            autoIndent: true
        });
        editor.getModel().onDidChangeContent(e => {
            console.log(e);
            const model = editor2.getModel();
            console.log(model);
            editor2.getModel().applyEdits(e);
            // editor2.getModel().applyEdits(e);
        })
        setEditor1(editor);
        console.log('init 1');
    }, [editorDiv1, editor2]);

    useEffect(() => {
        if (!editorDiv2) return;
        const editor = monaco.editor.create(editorDiv2, {
            language: 'java',
            autoIndent: true
        });
        setEditor2(editor);
        console.log('init 2');
    }, [editorDiv2]);

    return (
        <>
            <div>
                <TreeView
                    aria-label="file system navigator"
                    defaultCollapseIcon={<div className={'d-flex flex-row justify-content-center align-items-center'}>
                        <ExpandMore/>
                        <Source/>
                </div>}
                    defaultExpandIcon={<div className={'d-flex flex-row justify-content-center align-items-center'}>
                        <ChevronRight/>
                        <Source/>
                    </div>}
                    sx={{height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto'}}
                >
                    <TreeItem nodeId="1" label="Applications">
                        <TreeItem nodeId="2" label="Calendar"/>
                    </TreeItem>
                    <TreeItem nodeId="5" label="Documents">
                        <TreeItem nodeId="10" label="OSS"/>
                        <TreeItem nodeId="6" label="MUI">
                            <TreeItem icon={<JavascriptRounded/>} nodeId="8" label="index.js"/>
                        </TreeItem>
                    </TreeItem>
                </TreeView>
            </div>
        </>
    );
};
