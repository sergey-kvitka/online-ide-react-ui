import ReactDiffViewer, {DiffMethod} from 'react-diff-viewer';

const Prism = require('prismjs');

const highlightSyntax = str => (
    <pre
        style={{display: 'inline'}}

        dangerouslySetInnerHTML={{
            __html: Prism.highlight(str ? str : '', Prism.languages.javascript, 'javascript'), // ! JS for test
        }}
    />
);

export default function MyDiffViewer({code1, code2}) {



    return <div className={'diff-view'}>
        <ReactDiffViewer oldValue={code1} newValue={code2}
                         compareMethod={DiffMethod.WORDS_WITH_SPACE}
                         splitView={true}
                         renderContent={highlightSyntax} //TODO not working
        />
    </div>;
};
/*
useEffect(() => {
        const eventName = (event) => {
            fetch('http://localhost:8800/ide/api/auth/test/100', {
                method: 'GET'
            }).then(res => {
            });
        };
        const eventName2 = (event) => {
            fetch('http://localhost:8800/ide/api/auth/test/200', {
                method: 'GET'
            }).then(res => {
            });
        };
        window.addEventListener("unload", eventName);
        window.addEventListener("beforeunload", eventName2);

        return () => {
            window.removeEventListener('unload', eventName);
            window.removeEventListener('beforeunload', eventName2);
        };
    });
 */