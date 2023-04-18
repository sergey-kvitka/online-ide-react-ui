import {useEffect, useState} from 'react';

export default function FileListElement({file}) {
    return file ? (
        <div
            className={'border border-dark'}
        >
            <div>{file['path']}</div>
        </div>
    ) : null;
};
