import {Route, Routes} from "react-router-dom";
import ProjectList from './project/ProjectList'
import Login from "./auth/Login";
import PrivateRoute from "./PrivateRoute";
import Header from "./Header";
import ProjectInfo from "./project/ProjectInfo";
import Workspace from "./project/Workspace";
import {useState} from "react";
import Register from "./auth/Register";

export default function Application() {

    const [currentProjectInfo, setCurrentProjectInfo] = useState({
        'page': 'NONE'
    });

    const [isAuthorized, setIsAuthorized] = useState(false);

    const setProjectInfoValue = newValue => setCurrentProjectInfo(newValue)

    const setIsAuthorizedValue = bool => setIsAuthorized(bool);

    return (<>
        <Header currentProjectInfo={currentProjectInfo} isAuthorized={isAuthorized}/>
        <Routes>

            <Route path='/login' element={<Login isAuthorizedSetter={setIsAuthorizedValue}/>}/>
            <Route path='/register' element={<Register isAuthorizedSetter={setIsAuthorizedValue}/>}/>

            <Route path={'/'} exact element={<>test</>}/>

            <Route path='/projects' element={
                <PrivateRoute>
                    <ProjectList
                        isAuthorizedSetter={setIsAuthorizedValue}
                    />
                </PrivateRoute>
            }/>

            <Route path='/project/:project_uuid/info' element={
                <PrivateRoute>
                    <ProjectInfo
                        currentProjectInfoSetter={setProjectInfoValue}
                        isAuthorizedSetter={setIsAuthorizedValue}
                    />
                </PrivateRoute>
            }/>

            <Route path='/project/workspace/:project_uuid/:file_uuid?' element={
                <PrivateRoute>
                    <Workspace
                        currentProjectInfoSetter={setProjectInfoValue}
                        isAuthorizedSetter={setIsAuthorizedValue}
                    />
                </PrivateRoute>
            }/>

        </Routes>
    </>);
}