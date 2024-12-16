import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

type ConsentDialogProps = {
    open: boolean; 
    onAccept: () => void; 
    onDecline: () => void;  
  };
//Not in use yet
  const ConsentPopUp: React.FC<ConsentDialogProps> = ({ open , onAccept, onDecline}) => {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>Suostumus tietojen käsittelyyn</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Sovellus tarvitsee suostumuksesi tietojen käsittelyyn, jotta voit käyttää tiettyjä toimintoja, kuten
            sprinttinäkymää ja tasapainokorttia. Hyväksytkö tietojen käsittelyn?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onAccept}   variant="contained" color="primary">
            Hyväksy
          </Button>
          <Button onClick={onDecline} color="secondary">
            En hyväksy
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ConsentPopUp;