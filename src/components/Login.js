import {useEffect, useState} from "react";
import {useLocalState} from "../util/useLocalStorage";
import {useNavigate} from "react-router-dom";
import Constants from "../util/Constants";
import Methods from "../util/Methods";
import {Button, Container, TextField} from "@mui/material";

export default function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('test');

    const [jwt, setJwt] = useLocalState('', Constants.JWT_LS_KEY, true);

    const navigate = useNavigate();

    function loginRequest() {
        let credentials = {
            username: username.trim(),
            password: password
        };
        fetch(Methods.getIdeApiURL(Constants.IDE_API_LOGIN), {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(credentials)
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(Constants.WRONG_LOGIN_PASSWORD);
            })
            .then(data => {
                setJwt(Constants.BEARER_PREFIX + data['token']);
            })
            .catch(message => {
                alert(message); //todo alert
            });
    }

    useEffect(() => {
        if (jwt === '') return;
        navigate('/projects');
    }, [jwt]);

    return (<Container sx={{mt: 3}}>

        <TextField
            sx={{mb: 1}}
            label={'Имя пользователя'}
            variant={'outlined'}
            type={"text"}
            id={"username"}
            value={username}
            onChange={event => setUsername(event.target.value)}/>

        <br/>

        <TextField
            label={'Пароль'}
            variant={'outlined'}
            type={"password"}
            id={"passport"}
            value={password}/>

        <div>
            <Button
                variant={'contained'}
                id={'submit'}
                type={'button'}
                onClick={() => loginRequest()}
            >
                Авторизоваться
            </Button>
        </div>
    </Container>);
}


