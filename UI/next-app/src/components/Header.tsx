import React from 'react';
import { AppBar, Toolbar, Typography, Button, makeStyles, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    appBar: {
        backgroundColor: '#FFFFFF',
    },
    title: {
        flexGrow: 1,
        marginRight: theme.spacing(3),
        fontFamily: '"Comic Sans MS", cursive, sans-serif',
        fontWeight: 'bold',
        color: '#000000',

    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    titleLink: {
        textDecoration: "none",
        '&:hover': {
            cursor: 'pointer',
            textDecoration: 'none'
        },
        color: '#000000',

    },
    link: {
        fontSize: "14px",
        textDecoration: "none",
        color: '#000000',
        marginRight: theme.spacing(3),  // Adding separation between links.
        '&:hover': {
            cursor: 'pointer',
            textDecoration: 'none'
        }
    },
    button: {
        color: '#000000'
    }
}));

const Header = () => {
    const classes = useStyles();

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item className={classes.titleContainer}>
                        <Typography variant="h6" className={classes.title}>
                            <a href="/" className={classes.titleLink}>BILLBOARD</a>
                        </Typography>
                        <Typography variant="h6" display="inline">
                            <a href="/campaign" className={classes.link}>Campaigns</a>
                        </Typography>
                        <Typography variant="h6" display="inline">
                            <a href="/integrator" className={classes.link}>Integrators</a>
                        </Typography>
                        <Typography variant="h6" display="inline">
                            <a href="/MintNFT" className={classes.link}>MintNFT Protocol</a>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button className={classes.button} onClick={() => window.open('https://github.com/MichaelC1999/billboard', '_blank')}>GitHub</Button>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
