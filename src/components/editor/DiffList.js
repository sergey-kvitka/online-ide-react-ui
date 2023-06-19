import {useEffect, useState} from 'react';
import Methods from "../../util/Methods";
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";
import DiffElement from "./DiffElement";

export default function DiffList({canRestore, projectUUID, fileId, restoreHandler}) {

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);

    const [diffs, setDiffs] = useState([]);

    useEffect(() => {
        getDiffs();
    }, []);

    function getDiffs() {
        fetch(Methods.getIdeApiURL(`codeDiff/get/${fileId}`), {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization': jwt}
        })
            .then(response => {
                return response.json();
            })
            .then(diffs => {
                setDiffs(diffs);
            });
    }

    return <>
        <div className={'w-75'} style={{margin: '0 auto'}}>
            {
                diffs.map(diff => {
                    return <DiffElement canRestore={canRestore} key={diff['dateAfter']} diff={diff} restoreHandler={restoreHandler}/>
                })
            }
        </div>
    </>;
};
