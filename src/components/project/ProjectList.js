import {useEffect, useState} from 'react';
import Methods from "../../util/Methods";
import Constants from "../../util/Constants";
import {useLocalState} from "../../util/useLocalStorage";
import ProjectListItem from "./ProjectListItem";
import {Stack} from "react-bootstrap";
import {Container} from "@mui/material";

export default function ProjectList() {

    const [jwt,] = useLocalState('', Constants.JWT_LS_KEY);
    const [projectList, setProjectList] = useState([]);

    const [listElements, setListElements] = useState([]);

    function getProjectList() {
        fetch(Methods.getIdeApiURL(Constants.IDE_API_GET_PROJECTS), {
            headers: {'Content-Type': 'application/json', 'Authorization': jwt},
            method: 'GET'
        })
            .then(response => {
                return response.json();
            })
            .then(projects => {
                setProjectList(projects);
            });
    }

    useEffect(() => {
        getProjectList();
    }, []);

    useEffect(() => {
        let i = 0;
        const listElements = projectList.map(projectInfo =>
            <ProjectListItem className={'border'} key={i++} projectInfo={projectInfo}/>);
        setListElements(listElements);
    }, [projectList]);

    return (
        <Container>
            <Stack direction={'vertical'} gap={4}>
                {listElements}
            </Stack>
        </Container>
    );
}
