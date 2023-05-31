import {useEffect} from 'react';
import Methods from "../../util/Methods";

export default function ProjectRunInfo({projectRunChecking, projectUUID, intervalTime, runInfoHandler}) {

    useEffect(() => {

        if (!projectRunChecking) return;

        const interval = setInterval(() => {
            fetch(Methods.getExecApiURL(`mavenExecInfo/${projectUUID}`))
                .then(response => {
                    const httpCode = response.status;
                    if (httpCode === 200) return response.json();
                    if (httpCode === 204) return Promise.reject(null);
                })
                .then(result => {
                    if (!projectRunChecking) return;
                    runInfoHandler(result);
                })
                .catch(_null => {
                    if (!projectRunChecking) return;
                    runInfoHandler(null);
                    if (_null != null) console.log(_null);
                });
        }, intervalTime * 1000);

        return () => clearInterval(interval);

    }, [projectUUID, projectRunChecking, intervalTime]);

    return <></>;
};
