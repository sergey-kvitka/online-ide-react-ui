// noinspection JSValidateTypes

import {useState} from 'react';
import Methods from "../../util/Methods";
import {Popover, Typography} from "@mui/material";

export default function LastChangeInfo({lastChange}) {

    const {
        userNames: {
            username: username,
            firstName: firstName,
            lastName: lastName
        },
        lastChange: lastChangeStr
    } = lastChange;

    const letter = getFirstLetter(firstName);
    const backgroundColor = stringToColor(username);
    const fontColor = colorToBrightness(backgroundColor) > 0.75 ? 'black' : 'white';

    const lastChangeDate = new Date(lastChangeStr);

    const [popUpText, setPopUpText] = useState(`${firstName} ${lastName} (${username})\n${
        Methods.datePast(lastChangeDate)}`);

    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        setPopUpText(`${firstName} ${lastName} (${username})\n${Methods.datePast(lastChangeDate)}`);
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return <>
        <div
            className={'activity-circle'}
            style={{color: fontColor, background: backgroundColor}}
            aria-owns={open ? 'mouse-over-popover' : undefined}
            aria-haspopup={'true'}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
        >
            <p>{letter}</p>
        </div>
        <Popover
            id="mouse-over-popover"
            sx={{
                pointerEvents: 'none',
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
        >
            <Typography sx={{p: 1, whiteSpace: 'pre-line'}}>{popUpText}</Typography>
        </Popover>
    </>;
};

function getFirstLetter(name) {
    const length = name.length;
    for (let i = 0; i < length; i++) {
        let c = name.charAt(i);
        if (/[a-zA-Zа-яА-ЯёЁ]/.test(c)) return c;
    }
    return '?';
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}

function colorToBrightness(color) {
    const red = (hex[color.charAt(1)] * 16 + hex[color.charAt(2)]) / 256;
    const green = (hex[color.charAt(3)] * 16 + hex[color.charAt(4)]) / 256;
    const blue = (hex[color.charAt(5)] * 16 + hex[color.charAt(6)]) / 256;
    return Math.sqrt(0.299 * red * red + 0.587 * green * green + 0.114 * blue * blue);
}

const hex = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15
};