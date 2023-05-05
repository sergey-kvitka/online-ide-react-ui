import {useEffect, useState} from "react";
import {useLocalState} from "../../util/useLocalStorage";
import {useNavigate} from "react-router-dom";
import Constants from "../../util/Constants";
import Methods from "../../util/Methods";
import {Button, Container, Link, TextField, Typography} from "@mui/material";

const WIDTH = 400;

export default function Login({isAuthorizedSetter}) {

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [usernameHelp, setUsernameHelp] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordHelp, setPasswordHelp] = useState('');

    const [jwt, setJwt] = useLocalState('', Constants.JWT_LS_KEY, true);

    const navigate = useNavigate();

    function loginRequest() {
        let credentials = {
            'username': username.trim(),
            'password': password
        };
        fetch(Methods.getIdeApiURL(Constants.IDE_API_LOGIN), {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(credentials)
        })
            .then(response => {
                return (response.status === 200)
                    ? response.json()
                    : Promise.reject(response);
            })
            .then(data => {
                setJwt(Constants.BEARER_PREFIX + data['token']);
            })
            .catch(error => {
                return error.json()
                    .then(error => {
                        const causes = error['cause'].split(' ');
                        const helpText = error['message'];
                        if (causes.includes('username')) {
                            setUsernameError(true);
                            setUsernameHelp(helpText);
                        }
                        if (causes.includes('password')) {
                            setPasswordError(true);
                            setPasswordHelp(helpText);
                        }
                    });
            });
    }

    function validate() {
        const username_ = username.trim();
        setUsername(username_);
        const isUsernameEmpty = (username_.length === 0);
        if (isUsernameEmpty) {
            setUsernameError(true);
            setUsernameHelp('Введите имя пользователя');
        }
        const isPasswordEmpty = (password.length === 0);
        if (isPasswordEmpty) {
            setPasswordError(true);
            setPasswordHelp('Введите пароль');
        }
        return !(isPasswordEmpty || isUsernameEmpty);
    }

    function resetUsernameTextField() {
        setUsernameError(false);
        setUsernameHelp('');
    }

    function resetPasswordTextField() {
        setPasswordError(false);
        setPasswordHelp('');
    }

    useEffect(() => {
        isAuthorizedSetter(false);
    }, []);

    useEffect(() => {
        if (jwt === '') return;
        navigate('/projects');
    }, [jwt]);

    return (
        <Container
            sx={{mt: 4}}
            className={'d-flex flex-column align-items-center'}
        >
            <Typography
                variant={'h2'}
                sx={{mb: 5}}
            >Авторизация</Typography>

            <TextField
                sx={{mb: 4, width: WIDTH}}
                label={'Имя пользователя'}
                variant={'outlined'}
                type={"text"}
                id={"username"}
                value={username}
                error={usernameError}
                helperText={usernameHelp}
                onBlur={() => {
                    const username_ = username.trim();
                    setUsername(username_);
                    if (username_.length > 0) resetUsernameTextField();
                }}
                onChange={event => setUsername(event.target.value)}
            />

            <TextField
                sx={{mb: 4, width: WIDTH}}
                label={'Пароль'}
                variant={'outlined'}
                type={"password"}
                id={"passport"}
                value={password}
                error={passwordError}
                helperText={passwordHelp}
                onBlur={() => {
                    if (password.length > 0) resetPasswordTextField();
                }}
                onChange={event => setPassword(event.target.value)}
            />

            <div>
                <Button
                    size={"large"}
                    variant={'contained'}
                    id={'submit'}
                    type={'button'}
                    onClick={() => {
                        if (validate()) loginRequest();
                    }}
                >
                    Авторизоваться
                </Button>
            </div>

            <Link
                href={'/register'}
                style={{fontSize: 22, marginTop: 35, textAlign: "center"}}
            >Ещё нет аккаунта?<br/>Зарегистрируйтесь!</Link>

        </Container>);
}


