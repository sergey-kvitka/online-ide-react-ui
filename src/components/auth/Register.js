import {useEffect, useState} from 'react';
import {useLocalState} from "../../util/useLocalStorage";
import Constants from "../../util/Constants";
import {useNavigate} from "react-router-dom";
import Methods from "../../util/Methods";
import {Button, Container, Link, TextField, Typography} from "@mui/material";

const WIDTH = 400;
// noinspection RegExpUnnecessaryNonCapturingGroup,RegExpRedundantEscape
const EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

export default function Register({isAuthorizedSetter}) {

    // noinspection DuplicatedCode
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [usernameHelp, setUsernameHelp] = useState('');

    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState(false);
    const [firstNameHelp, setFirstNameHelp] = useState('');

    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState(false);
    const [lastNameHelp, setLastNameHelp] = useState('');

    // noinspection DuplicatedCode
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailHelp, setEmailHelp] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordHelp, setPasswordHelp] = useState('');

    const [repeatPassword, setRepeatPassword] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState(false);
    const [repeatPasswordHelp, setRepeatPasswordHelp] = useState('');

    const [jwt, setJwt] = useLocalState('', Constants.JWT_LS_KEY, true);

    const navigate = useNavigate();

    function registerRequest() {
        let credentials = {
            'username': username.trim(),
            'password': repeatPassword,
            'firstName': firstName.trim(),
            'lastName': lastName.trim(),
            'email': email.trim(),
        };
        fetch(Methods.getIdeApiURL(Constants.IDE_API_REGISTER), {
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
                        const helpText = error['message'];
                        const causes = error['cause'].split(' ');
                        if (causes.includes('username')) {
                            setUsernameError(true);
                            setUsernameHelp(helpText);
                        }
                        if (causes.includes('password')) {
                            setPasswordError(true);
                            setPasswordHelp(helpText);
                        }
                        if (causes.includes('email')) {
                            setEmailError(true);
                            setEmailHelp(helpText);
                        }
                    });
            });
    }

    function validateAll() {
        const results = [
            validateUsername(),
            validateFirstName(),
            validateLastName(),
            validateEmail(),
            validatePassword(),
            validateRepeatPassword()
        ];
        return !results.includes(false);
    }

    function validateUsername() {
        let username_ = username.trim();
        setUsername(username_);
        if (!/^[a-zA-Z0-9\-_.]{3,30}$/.test(username_)) {
            setUsernameError(true);
            setUsernameHelp(`Имя пользователя может состоять только из латинских букв и символов ` +
                `\'-\', \'_\' и \'.\', а также должно быть длиной от 3 до 30 символов`);
            return false;
        }
        if (!/[a-zA-Z]/.test(username_)) {
            setUsernameError(true);
            setUsernameHelp('Имя пользователя должно содержать хотя бы одну латинскую букву');
            return false;
        }
        if (/[\-_.][\-_.]/.test(username_)) {
            setUsernameError(true);
            setUsernameHelp('Имя пользователя не должно содержать последовательности из двух и более ' +
                'специальных символов (\'-\', \'_\' и \'.\')');
            return false;
        }
        if (/^[\-_.]/.test(username_) || /[\-_.]$/.test(username_)) {
            setUsernameError(true);
            setUsernameHelp('Имя пользователя не должно начинаться или заканчиваться на специальный символ ' +
                '(\'-\', \'_\' и \'.\')');
            return false;
        }
        setUsernameError(false);
        setUsernameHelp('');
        return true;
    }

    function validateFirstName() {
        let name_ = firstName.trim();
        setFirstName(name_);
        if (!/^[a-zA-Zа-яА-ЯёЁ'\- ]{2,25}$/.test(name_)) {
            setFirstNameError(true);
            setFirstNameHelp(`Имя может состоять только из букв (латиница и кириллица) и символов ` +
                `«-», «'» и « », а также должно быть длиной от 2 до 25 символов`);
            return false;
        }
        if (!/[a-zA-Zа-яА-ЯёЁ](.{0,25})[a-zA-Zа-яА-ЯёЁ]/.test(name_)) {
            setFirstNameError(true);
            setFirstNameHelp(`Имя должно содержать хотя бы две буквы (латиница или кириллица)`);
            return false;
        }
        if (/[\-'][\-']/.test(name_) || / {2}/.test(name_)) {
            setFirstNameError(true);
            setFirstNameHelp(`Имя не должно содержать последовательности 
            из двух и более специальных символов («-», «'» и « »)`);
            return false;
        }
        if (/^-/.test(name_) || /-$/.test(name_)) {
            setFirstNameError(true);
            setFirstNameHelp('Имя не должно начинаться или заканчиваться на символ «-»');
            return false;
        }
        setFirstNameError(false);
        setFirstNameHelp('');
        return true;
    }

    function validateLastName() {
        let name_ = lastName.trim();
        setLastName(name_);
        if (!/^[a-zA-Zа-яА-ЯёЁ'\- ]{2,25}$/.test(name_)) {
            setLastNameError(true);
            setLastNameHelp(`Фамилия может состоять только из букв (латиница и кириллица) и символов ` +
                `«-», «'» и « », а также должно быть длиной от 2 до 25 символов`);
            return false;
        }
        if (!/[a-zA-Zа-яА-ЯёЁ](.{0,25})[a-zA-Zа-яА-ЯёЁ]/.test(name_)) {
            setLastNameError(true);
            setLastNameHelp(`Фамилия должна содержать хотя бы две буквы (латиница или кириллица)`);
            return false;
        }
        if (/[\-'][\-']/.test(name_) || / {2}/.test(name_)) {
            setLastNameError(true);
            setLastNameHelp(`Фамилия не должна содержать последовательности 
            из двух и более специальных символов («-», «'» и « »)`);
            return false;
        }
        if (/^-/.test(name_) || /-$/.test(name_)) {
            setLastNameError(true);
            setLastNameHelp('Фамилия не должна начинаться или заканчиваться на символ «-»');
            return false;
        }
        setLastNameError(false);
        setLastNameHelp('');
        return true;
    }

    function validateEmail() {
        let mail = email.trim();
        setEmail(mail);
        if (mail.length > 100) {
            setEmailError(true);
            setEmailHelp('Длина адреса электронной почты не должна превышать 100 символов');
            return false;
        }
        if (!EMAIL_REGEX.test(mail)) {
            setEmailError(true);
            setEmailHelp('Неверный формат адреса электронной почты');
            return false;
        }
        setEmailError(false);
        setEmailHelp('');
        return true;
    }

    function validatePassword() {
        const length = password.length;
        if (length < 4 || length > 40) {
            setPasswordError(true);
            setPasswordHelp('Длина пароля должна быть в диапазоне от 4 до 40 символов');
            return false;
        }
        setPasswordError(false);
        setPasswordHelp('');
        return true;
    }

    function validateRepeatPassword() {
        if (password !== repeatPassword) {
            setRepeatPasswordError(true);
            setRepeatPasswordHelp('Пароли должны совпадать');
            return false;
        }
        setRepeatPasswordError(false);
        setRepeatPasswordHelp('');
        return true;
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
            className={'d-flex flex-column align-items-center bigger-help-text'}
        >
            <Typography
                variant={'h2'}
                sx={{mb: 5}}
            >Регистрация</Typography>

            <TextField
                sx={{mb: 3, width: WIDTH}}
                label={'Имя пользователя *'}
                variant={'outlined'}
                type={"text"}
                id={"username"}
                value={username}
                helperText={usernameHelp}
                error={usernameError}
                onBlur={() => validateUsername()}
                onChange={event => setUsername(event.target.value)}
            />

            <TextField
                sx={{mb: 3, width: WIDTH}}
                label={'Имя *'}
                variant={'outlined'}
                type={"text"}
                id={"firstName"}
                value={firstName}
                helperText={firstNameHelp}
                error={firstNameError}
                onBlur={() => validateFirstName()}
                onChange={event => setFirstName(event.target.value)}
            />

            <TextField
                sx={{mb: 3, width: WIDTH}}
                label={'Фамилия *'}
                variant={'outlined'}
                type={"text"}
                id={"firstName"}
                value={lastName}
                helperText={lastNameHelp}
                error={lastNameError}
                onBlur={() => validateLastName()}
                onChange={event => setLastName(event.target.value)}
            />

            <TextField
                sx={{mb: 3, width: WIDTH}}
                label={'Адрес электронной почты *'}
                variant={'outlined'}
                type={"email"}
                id={"email"}
                value={email}
                helperText={emailHelp}
                error={emailError}
                onBlur={() => validateEmail()}
                onChange={event => setEmail(event.target.value)}
            />

            <TextField
                sx={{mb: 3, width: WIDTH}}
                label={'Пароль *'}
                variant={'outlined'}
                type={"password"}
                id={"passport"}
                value={password}
                helperText={passwordHelp}
                error={passwordError}
                onBlur={() => {
                    validatePassword();
                    validateRepeatPassword();
                }}
                onChange={event => setPassword(event.target.value)}
            />

            <TextField
                sx={{mb: 4, width: WIDTH}}
                label={'Повтор пароля *'}
                variant={'outlined'}
                type={"password"}
                id={"passportRepeat"}
                value={repeatPassword}
                helperText={repeatPasswordHelp}
                error={repeatPasswordError}
                onBlur={() => {
                    validatePassword();
                    validateRepeatPassword();
                }}
                onChange={event => setRepeatPassword(event.target.value)}
            />

            <div>
                <Button
                    size={"large"}
                    variant={'contained'}
                    id={'submit'}
                    type={'button'}
                    onClick={() => {
                        const result = validateAll();
                        if (result) registerRequest();
                    }}
                >
                    Зарегистрироваться
                </Button>
            </div>

            <Link
                href={'/login'}
                style={{fontSize: 22, marginTop: 35, marginBottom: 40, textAlign: "center"}}
            >Уже зарегистрированы?<br/>Авторизуйтесь!</Link>

        </Container>);
};
