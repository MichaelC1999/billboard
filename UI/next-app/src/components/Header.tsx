'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, makeStyles, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    appBar: {
        backgroundColor: '#FFFFFF',
    },
    title: {
        flexGrow: 1,
        marginRight: theme.spacing(3), // Add a bit of spacing between the title and buttons
        fontFamily: '"Comic Sans MS", cursive, sans-serif', // Adjust as per your preferred logo style font
        fontWeight: 'bold',
        color: '#000000'
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    button: {
        color: '#000000'
    }
}));

const Header = () => {
    const classes = useStyles();
    const router = useRouter();

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item className={classes.titleContainer}>
                        <Typography variant="h6" className={classes.title}>
                            BILLBOARD
                        </Typography>
                        <Button className={classes.button} onClick={() => router.push('/campaign')}>Campaigns</Button>
                        <Button className={classes.button} onClick={() => router.push('/integrator')}>Integrators</Button>
                        <Button className={classes.button} onClick={() => router.push('/MintNFT')}>MintNFT Protocol</Button>
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