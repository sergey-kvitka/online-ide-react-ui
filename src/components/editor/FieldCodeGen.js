import {useEffect, useState} from 'react';
import {IconButton, TextField} from "@mui/material";
import {Add, Clear} from "@mui/icons-material";

const MATCH_GENERIC = /<([^)]+)>/;

export default function FieldCodeGen({field, changeHandler, deleteHandler, addHandler}) {

    const id = field['id'];

    const [modifiers, setModifiers] = useState(field['modifiers']);
    const [typeAndGeneric, setTypeAndGeneric] = useState('' + field['type'] + field['generic']);
    const [name, setName] = useState(field['name']);
    const [defaultValue, setDefaultValue] = useState(field['default']);

    const handleChange = () => {
        let generic;
        if (typeAndGeneric.includes('<') && typeAndGeneric.includes('>')) {
            generic = `<${MATCH_GENERIC.exec(typeAndGeneric)[1]}>`;
        } else generic = '';
        const type = typeAndGeneric.replace(generic, '');
        changeHandler({
            'id': id, 'modifiers': modifiers,
            'type': type, 'generic': generic,
            'name': name, 'default': defaultValue
        });
    }

    const handleDelete = () => {
        deleteHandler(id);
    }

    const handleAdd = () => addHandler();

    useEffect(() => {
        handleChange();
    }, [modifiers, typeAndGeneric, name, defaultValue]);

    return <>
        <div
            className={'d-flex flex-row align-items-center w-100'}
            style={{gap: '5px', margin: '12px 0'}}
        >
            <TextField
                sx={{'.MuiInputBase-input': {fontFamily: 'Consolas, serif'}}}
                style={{flexShrink: 2}}
                size={"small"}
                label={'Модификаторы'}
                value={modifiers}
                onChange={event => {
                    setModifiers(event.target.value);
                }}
            />
            <TextField
                sx={{'.MuiInputBase-input': {fontFamily: 'Consolas, serif'}}}
                style={{flexShrink: 2}}
                size={"small"}
                label={'Тип данных*'}
                value={typeAndGeneric}
                onChange={event => {
                    setTypeAndGeneric(event.target.value);
                }}
            />
            <TextField
                sx={{'.MuiInputBase-input': {fontFamily: 'Consolas, serif'}}}
                style={{flexShrink: 3}}
                size={"small"}
                label={'Название*'}
                value={name}
                onChange={event => {
                    setName(event.target.value);
                }}
            />
            =
            <TextField
                sx={{'.MuiInputBase-input': {fontFamily: 'Consolas, serif'}}}
                style={{flexShrink: 2}}
                size={"small"}
                label={'Значение по-умолчанию'}
                value={defaultValue}
                onChange={event => {
                    setDefaultValue(event.target.value);
                }}
            />
            <IconButton
                style={{flexShrink: 10, padding: '8px 0'}}
                onClick={handleAdd}
            >
                <Add color={"success"}/>
            </IconButton>
            <IconButton
                style={{flexShrink: 10, padding: '8px 0'}}
                onClick={handleDelete}
            >
                <Clear color={'error'}/>
            </IconButton>
        </div>
    </>;
};
