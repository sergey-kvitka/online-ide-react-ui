import {Terminal} from "@mui/icons-material";
import {AppBar, IconButton, Link, Toolbar, Typography} from "@mui/material";

export default function Header() {



    return (
        <AppBar className={'app-bar'} position={'sticky'}>
            <Toolbar className={'d-flex justify-content-between w-100'}>
                <div className={'d-flex align-items-center'} style={{flexGrow: 0.5}}>
                    <Typography
                        variant={'h5'}
                        component={'span'}
                    >Среда разработки Java</Typography>
                    <IconButton
                        sx={{ml: 1}}
                        color={'inherit'}
                    >
                        <Terminal/>
                    </IconButton>
                </div>

                <Link className={'no-style-link'} style={{flexGrow: 10}}>Мои проекты</Link>
                <Link className={'no-style-link'} style={{marginRight: 15}}>Выйти</Link>

            </Toolbar>
        </AppBar>
    );
};
