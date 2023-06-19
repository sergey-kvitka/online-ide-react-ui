import {useState} from 'react';
import {Button, Modal, Typography} from "@mui/material";
import Methods from "../../util/Methods";
import ModalCloseIcon from "../ModalCloseIcon";
import MyDiffViewer from "./MyDiffViewer";

export default function DiffElement({canRestore, diff, restoreHandler}) {

    const userNames = diff['userNames'];

    const codeBefore = diff['codeBefore'];
    const codeAfter = diff['codeAfter'];

    const dateBefore = new Date(diff['dateBefore']);
    const dateAfter = new Date(diff['dateAfter']);
    const fullDateBefore = Methods.fullDateTime(dateBefore);
    const fullDateAfter = Methods.fullDateTime(dateAfter);
    const dateBeforePast = Methods.datePast(dateBefore);
    const dateAfterPast = Methods.datePast(dateAfter);

    const [showDiff, setShowDiff] = useState(false);

    return <>
        <div
            className={'w-100 border border-dark border-opacity-25 d-flex flex-row align-items-center'}
            style={{padding: '15px 20px 15px', margin: '10px 0', borderRadius: 8, flexShrink: 0}}
        >
                <span
                    style={{whiteSpace: 'nowrap', display: 'inline-flex'}}
                >
                    <Typography
                        variant={'h5'}
                        title={`${userNames['firstName']} ${userNames['lastName']}`}
                    >
                        Пользователь <b style={{
                        cursor: 'pointer'
                    }}
                    >{userNames['username']}</b>
                    </Typography>
                </span>
            <span style={{flexGrow: 1, marginLeft: 15}}>Изменение от <u title={dateAfterPast}
                                                                        style={{cursor: "pointer"}}>
                        {fullDateAfter}
                    </u></span>
            <Button
                onClick={() => setShowDiff(true)}
            >
                Просмотр изменений
            </Button>
        </div>

        <Modal
            open={showDiff}
            onClose={() => setShowDiff(false)}
        >
            <div
                className={'modal-center bg-white'}
                style={{
                    padding: '30px 40px',
                    maxHeight: '90vh',
                    width: '90vw',
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <ModalCloseIcon closeFunction={() => setShowDiff(false)}/>
                <h1 style={{textAlign: "center", marginBottom: 5}}>Просмотр изменений</h1>
                <div className={'d-flex flex-row justify-content-around mb-2'}>
                    <span style={{fontSize: 20}}>Версия от <u title={dateBeforePast} style={{cursor: "pointer"}}>
                        {fullDateBefore}
                    </u></span>
                    <span style={{fontSize: 20}}>Версия от <u title={dateAfterPast} style={{cursor: "pointer"}}>
                        {fullDateAfter}
                    </u></span>
                </div>
                <div style={{overflowY: "scroll", border: '1px solid #cccccc', borderRadius: 10}}>
                    <MyDiffViewer code1={codeBefore} code2={codeAfter}/>
                </div>
                {canRestore ?
                <div className={'d-flex flex-row justify-content-around mt-3'}>
                    <Button
                        variant={'contained'}
                        onClick={() => restoreHandler(codeBefore)}
                    >
                        Восстановить версию слева
                    </Button>
                    <Button
                        variant={'contained'}
                        onClick={() => restoreHandler(codeAfter)}
                    >
                        Восстановить версию справа
                    </Button>
                </div> : <></>}
            </div>
        </Modal>
    </>;
};
