import {useEffect} from 'react';
import Methods from "../../util/Methods";

const ACTUALIZE_INTERVAL = 1000;

export default function ProjectMonitoring({
                                              jwt,
                                              projectUUID,
                                              currentProjectRole,
                                              filesAndFolders,
                                              messageHandler,
                                              changeListHandler = null,
                                              filesUpdateHandler = null,
                                              stop
                                          }) {

    useEffect(() => {
        if (stop) return;
        const interval = setInterval(() => {
            // noinspection JSCheckFunctionSignatures
            fetch(Methods.getIdeApiURL('auth/actualizeProjectInfo'), {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': jwt},
                body: JSON.stringify({
                    'projectUUID': projectUUID,
                    'projectRole': currentProjectRole,
                    'currentFilesAndFolders': filesAndFolders
                })
            })
                .then(response => response.json())
                .then(result => {
                    const projectExists = result['projectExists'];
                    const isParticipant = result['isParticipant'];
                    const roleChanged = result['roleChanged'];
                    let message;
                    if (!projectExists) message = 'projectDoesNotExist';
                    else if (!isParticipant) message = 'notAParticipant';
                    else if (roleChanged) message = 'roleChanged';
                    if (!stop && message) messageHandler(message);

                    if (changeListHandler) changeListHandler(result['lastChangesInfo']);
                    if (filesUpdateHandler && result['filesAndFoldersChanged']) filesUpdateHandler();
                });
        }, ACTUALIZE_INTERVAL);
        return () => clearInterval(interval);
    }, [projectUUID, stop, jwt, currentProjectRole]);

    return <></>;
};
