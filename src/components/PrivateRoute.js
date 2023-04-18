import {useEffect, useState} from 'react';
import {useLocalState} from "../util/useLocalStorage";
import {Navigate} from "react-router-dom";
import Constants from "../util/Constants";
import Methods from "../util/Methods";

export default function PrivateRoute({children, role = Constants.ROLE_USER}) {

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);
    const [roles, setRoles] = useState(null);

    function validateToken() {
        fetch(Methods.getIdeApiURL(Constants.IDE_API_VALIDATE_JWT), {
            headers: {'Content-Type': 'text/plain', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => response.json())
            .then(roles => {
                setRoles(roles);
            })
            .catch(() => { // todo smth wrong
                setRoles([]);
            });
    }

    function matchRole() {
        if (!roles) return false;
        return roles.includes(role);
    }

    useEffect(() => validateToken(), []);

    return (roles ? (matchRole() ? children : <Navigate to={'/login'}/>) : <></>);
};
