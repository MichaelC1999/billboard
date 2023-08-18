'use client';

import { Box, Container, Typography, Link, makeStyles, Divider, Grid } from '@material-ui/core';
import Header from '../components/Header';

const useStyles = makeStyles((theme) => ({
  section: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  image: {
    width: '100%',
    height: 'auto',
  },
  distinctSection: {
    backgroundColor: theme.palette.grey[200],
    padding: theme.spacing(4, 0),
  },
  whiteLink: {
    color: '#fff',
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    }
  },
}));

const HomePage = () => {
  const classes = useStyles();

  return (
    <>
      <Header />
      <Container>
        <Box className={classes.section}>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec erat et lectus ultrices tincidunt.
          </Typography>
          <Typography variant="body1" paragraph>
            Duis dignissim metus nec justo vulputate, non porta felis luctus. Maecenas quis elit at dui aliquet porta.
          </Typography>
        </Box>

        <Box className={`${classes.section} ${classes.distinctSection}`}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <img src="https://raw.githubusercontent.com/MichaelC1999/billboard/main/UI/next-app/src/img/Snap.png" alt="Descriptive alt text" className={classes.image} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                Billboard Snap: How Digital Marketing Becomes Web3
              </Typography>
              <Typography variant="body1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Donec in efficitur leo, at dignissim nunc. Suspendisse potenti.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider className={classes.section} />

        <Box className={classes.section}>
          <Typography variant="h4" component={Link} className={classes.whiteLink}>
            Section 1
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor interdum purus, ac gravida orci tincidunt eget.
          </Typography>
        </Box>

        <Box className={classes.section}>
          <Typography variant="h4" component={Link} className={classes.whiteLink}>
            Section 2
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor interdum purus, ac gravida orci tincidunt eget.
          </Typography>
        </Box>

        <Box className={classes.section}>
          <Typography variant="h4" component={Link} className={classes.whiteLink}>
            Section 3
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor interdum purus, ac gravida orci tincidunt eget.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;