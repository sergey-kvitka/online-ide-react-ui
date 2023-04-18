import React from 'react';
import ReactDOM from 'react-dom/client';
import Application from "./components/Application";
import {BrowserRouter} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Application/>
    </BrowserRouter>
);
