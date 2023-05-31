import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {java} from '@codemirror/lang-java';

export default function NewFileEditorV3()  {
    const onChange = React.useCallback((value, viewUpdate) => {
        console.log('value:', value);
    }, []);
    return (
        <CodeMirror
            value="console.log('hello world!');"
            height="200px"
            extensions={[java()]}
            onChange={onChange}
        />
    );
}