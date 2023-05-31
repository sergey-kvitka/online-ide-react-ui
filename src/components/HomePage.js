import MonacoEditor from 'react-monaco-editor';
import {useCallback, useEffect, useState} from "react";
import * as monaco from 'monaco-editor-core';

export default function HomePage() {

    const text = `
@Annotation
public class SpringApiApplication {

    static void aa() {
        System.out.println("Hello \\n world");
    }

    public static void main(String[] args) {
        SpringApplication.run(SpringApiApplication.class, args);
    }
}
    `;

    const [code, setCode] = useState(text);

    const [monacoEditor, setMonacoEditor] = useState(null);
    const [monacoEditor2, setMonacoEditor2] = useState(null);

    const [changer, setChanger] = useState(null);

    const [a,b]=useState(null);

    const ref1 = useCallback(w => {

    }, []);


    useEffect(() => {
        if (!monacoEditor || !monacoEditor2) return;

        setChanger(e => {
           monacoEditor2.getModel().applyEdits(e);
        });

    }, [monacoEditor, monacoEditor2]);

    useEffect(() => {
        console.log('use effect 1');
        if (monacoEditor == null) return;
        b(setTimeout(() => {
            console.log('timeout');
            monacoEditor.executeEdits(JSON.parse('{"changes":[{"range":{"startLineNumber":4,"startColumn":1,"endLineNumber":4,"endColumn":1},"rangeLength":0,"text":"static void aa() {\\n        System.out.println(\\"Hello \\\\n world\\");\\n    }\\n\\n    public static void main(String[] args) {\\n        SpringApplication.run(SpringApiApplication.class, args);\\n    }","rangeOffset":49,"forceMoveMarkers":false}],"eol":"\\n","isEolChange":false,"versionId":2,"isUndoing":false,"isRedoing":false,"isFlush":false}'));
        }, 10000));
    }, [monacoEditor]);

    // let r = setTimeout(() => {
    //     monacoEditor.getModel().applyEdits(JSON.parse('{"changes":[{"range":{"startLineNumber":4,"startColumn":1,"endLineNumber":4,"endColumn":1},"rangeLength":0,"text":"static void aa() {\\n        System.out.println(\\"Hello \\\\n world\\");\\n    }\\n\\n    public static void main(String[] args) {\\n        SpringApplication.run(SpringApiApplication.class, args);\\n    }","rangeOffset":49,"forceMoveMarkers":false}],"eol":"\\n","isEolChange":false,"versionId":2,"isUndoing":false,"isRedoing":false,"isFlush":false}'));
    // }, 10000);

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return;
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);
        editor.classList.add('eee');
        const me = monaco.editor.create(editor, {
            language: 'java',
            value: code,
            theme: 'vs-dark'
        });
        me.getModel().onDidChangeContent(e => {
            changer(e);
        });
        // me.executeEdits()

        setMonacoEditor(me);

    }, []);

    const wrapperRef2 = useCallback(wrapper => {
        if (wrapper == null) return;
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);
        editor.classList.add('eee');
        const me = monaco.editor.create(editor, {
            language: 'java',
            value: code,
            theme: 'vs-dark'
        });
        me.getModel().onDidChangeContent(e => {
            aa(e);
        });
        // me.executeEdits()

        setMonacoEditor2(me);

    }, []);

    function aa(e) {
        console.log(JSON.stringify(e));
    }

    return (<>
        {/*<MonacoEditor*/}
        {/*    height={'500'}*/}
        {/*    language="java"*/}
        {/*    defaultValue=''*/}
        {/*    value={code}*/}
        {/*    onChange={(newValue, event) => {*/}
        {/*        setCode(newValue);*/}
        {/*    }}*/}
        {/*/>*/}
        <div className={'hello'} style={{height: 500}} ref={wrapperRef}></div>
        <div className={'hello'} style={{height: 500}} ref={wrapperRef2}></div>
    </>);
};
const o = '{"changes":[{"range":{"startLineNumber":4,"startColumn":1,"endLineNumber":4,"endColumn":1},"rangeLength":0,"text":"static void aa() {\\n        System.out.println(\\"Hello \\\\n world\\");\\n    }\\n\\n    public static void main(String[] args) {\\n        SpringApplication.run(SpringApiApplication.class, args);\\n    }","rangeOffset":49,"forceMoveMarkers":false}],"eol":"\\n","isEolChange":false,"versionId":2,"isUndoing":false,"isRedoing":false,"isFlush":false}';
const e = `
static void aa() {
        System.out.println("Hello \\n world");
    }

    public static void main(String[] args) {
        SpringApplication.run(SpringApiApplication.class, args);
    }
`;