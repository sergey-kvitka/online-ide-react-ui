import {IconButton} from "@mui/material";
import {Clear} from "@mui/icons-material";

export default function ModalCloseIcon({
                                           closeFunction,
                                           margin = '8px',
                                           title = 'Закрыть',
                                           opacity = 'unset',
                                           background = 'unset'
                                       }) {

    return (
        <div
            style={{
                width: '100%',
                margin: 0,
                padding: 0
            }}
        >
            <div
                style={{
                    height: 0,
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    position: 'relative'
                }}
            >
                <IconButton
                    style={{
                        position: 'absolute',
                        right: 0,
                        padding: 0,
                        margin: margin,
                        opacity: opacity,
                        background: background
                    }}
                    title={title}
                    className={'modal-close-icon'}
                    onClick={closeFunction}
                >
                    <Clear
                        color={"error"}
                        fontSize={"large"}
                    />
                </IconButton>
            </div>
        </div>
    );
};
