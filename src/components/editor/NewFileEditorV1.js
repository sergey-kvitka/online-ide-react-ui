import {useCallback, useState} from 'react';
import MonacoEditor from "react-monaco-editor";
import {useParams} from "react-router-dom";

export default function NewFileEditorV1() {

    const {file_uuid: documentId} = useParams();

    const [editor, setEditor] = useState();

    const [value, setValue] = useState(
        `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world");
    }
}
    `);


    const editorRef = useCallback(element => {
        if (element == null) return;
        setEditor(element);
    }, []);

    return (
        <div className={'d-flex flex-column editor-container'}>
            <div style={{height: '100%'}}>
                <MonacoEditor
                    ref={editorRef}
                    language="java"
                    value={value}
                    options={{
                        fontSize: '18px'
                    }}
                    // value={code}
                    onChange={(newValue, event) => {
                        console.log(JSON.stringify(event));
                        setValue(newValue);
                    }}

                />
            </div>
        </div>
    );
};//{"changes":[{"range":{"startLineNumber":4,"startColumn":6,"endLineNumber":4,"endColumn":6},"rangeLength":0,"text":"\n    ","rangeOffset":113,"forceMoveMarkers":false}],"eol":"\n","versionId":2,"isUndoing":false,"isRedoing":false,"isFlush":false}
