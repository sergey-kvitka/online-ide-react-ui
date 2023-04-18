import {Route, Routes} from "react-router-dom";
import ProjectList from './project/ProjectList'
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import Header from "./Header";
import ProjectInfo from "./project/ProjectInfo";
import HomePage from "./HomePage";
import Workspace from "./project/Workspace";

export default function Application() {

    return (<>
        <Header/>
        <Routes>

            <Route path='/login' element={<Login/>}/>

            <Route path={'/'} exact element={<HomePage/>}/>

            <Route path='/projects' element={
                <PrivateRoute>
                    <ProjectList/>
                </PrivateRoute>
            }/>

            <Route path='/project/:project_uuid/info' element={
                <PrivateRoute>
                    <ProjectInfo/>
                </PrivateRoute>
            }/>

            <Route path='/project/workspace/:project_uuid/:file_uuid?' element={
                <PrivateRoute>
                    <Workspace/>
                </PrivateRoute>
            }/>

        </Routes>
    </>);
}