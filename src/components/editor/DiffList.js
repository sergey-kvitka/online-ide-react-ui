import {useEffect, useState} from 'react';
import Methods from "../../util/Methods";
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";

export default function DiffList({projectUUID, fileId}) {

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

    return <div>
        {
            diffs.map(diff => {
                return <div className={'border border-dark'}>
                    <p>{Methods.fullDateTime(new Date(diff['dateBefore']))}</p>
                    <p>{Methods.fullDateTime(new Date(diff['dateAfter']))}</p>
                    <p>{diff['userNames']['username']}</p>
                </div>
            })
        }
    </div>;
};
