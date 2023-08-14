import React, { useState } from "react";
import { Button, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, makeStyles } from "@material-ui/core";
import { useNetwork } from "wagmi";

const useStyles = makeStyles({
    select: {
        "&:focus": {
            backgroundColor: "transparent",
        },
    },
});

const InputForm = ({ inputs, setInputs, handleSubmit, title, elements, addElement, removeElement }: any) => {
    const classes = useStyles();
    const { chain } = useNetwork();
    const handleChange = (event: any) => {
        setInputs({
            ...inputs,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h3" color="primary">
                {title}
            </Typography>
            {elements.map((element: any) => {
                if (element.type === "addElement") {
                    return (<Button
                        variant="contained"
                        color="secondary"
                        onClick={addElement}
                        style={{ width: "100%", margin: "6px 0" }}
                    >
                        {element.label}
                    </Button>)

                } else if (element.type === "removeElement") {
                    return (<Button
                        variant="contained"
                        color="secondary"
                        onClick={removeElement}
                        style={{ width: "100%", margin: "6px 0" }}

                    >
                        {element.label}
                    </Button>)
                } else if (element.type !== "select") {
                    return (
                        <TextField
                            key={element.name}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id={element.name}
                            label={element.label}
                            name={element.name}
                            type={element.type}
                            autoComplete={element.name}
                            autoFocus
                            value={inputs[element.name]}
                            onChange={handleChange}
                        />
                    )
                } else {
                    return (
                        <FormControl variant="outlined" fullWidth margin="normal" key={element.name}>
                            <InputLabel id={element.name}>{element.label}</InputLabel>
                            <Select
                                labelId={element.name}
                                id={element.name}
                                name={element.name}
                                value={inputs[element.name] || ""} // Ensuring the value is not undefined
                                onChange={handleChange}
                                classes={{ select: classes.select }}
                            >
                                {element.options.map((item: string, idx: number) => <MenuItem key={'ops' + idx} value={item}>{item}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )
                }
            })}
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                style={{ marginTop: "6px" }}
                disabled={window.ethereum.networkVersion + "" !== process.env.CHAIN_ID + ""}
            >
                Submit
            </Button>
        </Container>
    );
};

export default InputForm;
