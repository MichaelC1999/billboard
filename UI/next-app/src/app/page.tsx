'use client';

import { Box, Container, Typography, Link, makeStyles, Divider, Grid } from '@material-ui/core';
import Header from '../components/Header';

const useStyles = makeStyles((theme) => ({
  section: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    maxWidth: '70%',  // Adjust this to change the width
    marginLeft: '15%',  // Adjust for centering
    marginRight: '15%',  // Adjust for centering
  },
  image: {
    width: '100%',
    height: 'auto',
  },
  distinctSection: {
    backgroundColor: theme.palette.grey[200],
    padding: theme.spacing(4, 0),
    maxWidth: '70%',  // Adjust this to change the width
    marginLeft: '15%',  // Adjust for centering
    marginRight: '15%',  // Adjust for centering
  },
  whiteText: {
    color: '#fff'
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
      <Container maxWidth="xl">
        <Box className={`${classes.section} ${classes.distinctSection}`}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <div style={{ margin: "8px", border: "1px black solid" }}>
                <img src="https://raw.githubusercontent.com/MichaelC1999/billboard/main/UI/next-app/src/img/Snap.png" alt="Descriptive alt text" className={classes.image} />
              </div>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h2" gutterBottom>
                Billboard Snap: How Digital Marketing Becomes Web3
              </Typography>
              <Typography variant="body1" style={{ fontSize: "18px" }}>
                Billboard is a decentralized advertising platform designed for the Web3 ecosystem. By utilizing Metamask Snaps integrated into the user interface of dApps, Billboard enables protocols to display ad campaigns and earn revenue without relying on centralized elements. This introduces a new revenue stream for protocols, showcasing ads at the most crucial point in the user flow, ensuring they're engaging without being obtrusive. As the $500 billion Digital Marketing industry looks to integrate with Web3, Billboard provides the perfect decentralized solution.
              </Typography>
              <br></br>
              <Typography variant="body1" style={{ fontSize: "18px" }}>
                When dApps implement Billboard on the frontend, the custom built Metamask Snap calls methods behind the scenes to make on-chain read calls for ad content. Aside from displaying the ad, the Snap has a role in verifying that users are served the intended ad content. With development of the Keyring API, Billboard is building a robust encryption system within Snaps, ensuring authenticated and verified ad views by the users. While Snaps doesn't support the rendering of images, the inclusion of this feature will unlock Billboard's full potential.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider className={classes.section} />

        <Box className={classes.section}>
          <Typography variant="h4" component={Link} className={classes.whiteLink} href="/campaign">
            Campaigns
          </Typography>
          <Typography variant="body1" paragraph className={classes.whiteText}>
            Campaigns are contracts that hold content and metadata about an advertisement campaign. Deployed through a factory contract, they're designed to be created by other protocols. While primarily intended to be interfaced by on-chain interactions, anyone can launch an advertising campaign by calling the factory's deployNewCampaign() function. The Billboard Campaign Dashboard demonstrates how campaigns can be deployed, managed, and the kinds of data they hold.
          </Typography>
          <Typography variant="h6" component={Link} className={classes.whiteLink} href="/campaign">
            View the Campaign Dashboard
          </Typography>
        </Box>

        <Box className={classes.section}>
          <Typography variant="h4" component={Link} className={classes.whiteLink} href="/integrator">
            Integrator
          </Typography>
          <Typography variant="body1" paragraph className={classes.whiteText}>
            An Integrator is a contract within the Billboard protocol functioning as middleware for a dApp looking to earn ad revenue. When a dApp decides to implement Billboard ads, it deploys an instance of this contract. After showing the user an ad, the Integrator verifies on-chain that an ad was served, registers the ad view, and then completes the initial user-requested transaction. The Billboard Integrator Dashboard aids in deploying new integrators and visualizing revenues and metrics of existing ones.
          </Typography>
          <Typography variant="h6" component={Link} className={classes.whiteLink} href="/integrator">
            View the Integrator Dashboard
          </Typography>
        </Box>

        <Box className={classes.section}>
          <Typography variant="h4" component={Link} className={classes.whiteLink} href="/MintNFT">
            MintNFT
          </Typography>
          <Typography variant="body1" paragraph className={classes.whiteText}>
            MintNFT serves as an illustrative example of how other projects integrate Billboard. MintNFT is a dApp where users can mint an NFT without any fees, with all revenue coming from displaying Billboard ads. When users wish to mint their NFT, first they have to view a Billboard ad. This approach displays how NFT collections, Dexes, Lending Protocols, and other dApps can earn ad revenue.
          </Typography>
          <Typography variant="h6" component={Link} className={classes.whiteLink} href="/MintNFT">
            Explore MintNFT
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;