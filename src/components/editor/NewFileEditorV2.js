import React from 'react';
import MonacoEditor from "react-monaco-editor/lib/editor";

const x = `{"changes":[{"range":{"startLineNumber":4,"startColumn":6,"endLineNumber":4,"endColumn":6},"rangeLength":0,"text":"a","rangeOffset":113,"forceMoveMarkers":false}],"eol":"\\n","versionId":5,"isUndoing":false,"isRedoing":false,"isFlush":false}`;

class NewFileEditorV2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world");
    }
}
    `,
        }
    }

    editorDidMount(editor, monaco) {
        editor.focus();
    }

    onChange(newValue, e) {
        // console.log(JSON.stringify(e));
    }

    render() {

        const code = this.state.code;

        const options = {
            selectOnLineNumbers: true,
            fontSize: 18
        };
        return <>
            <div className={'d-flex flex-column editor-container'}>
                <div style={{height: '100%'}}>
                    <MonacoEditor
                        language="java"
                        value={code}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />
                </div>
            </div>
        </>;
    }
} //{"changes":[{"range":{"startLineNumber":4,"startColumn":6,"endLineNumber":4,"endColumn":6},"rangeLength":0,"text":"\n    ","rangeOffset":113,"forceMoveMarkers":false}],"eol":"\n","versionId":2,"isUndoing":false,"isRedoing":false,"isFlush":false}
