import React, { useState } from "react";
import { Button, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    select: {
        "&:focus": {
            backgroundColor: "transparent",
        },
    },
});

const InputForm = ({ inputs, setInputs, handleSubmit, title, elements }: any) => {

    const classes = useStyles();

    const handleChange = (event: any) => {
        setInputs({
            ...inputs,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h6" color="primary">
                {title}
            </Typography>
            {elements.map((element: any) => {
                if (element.type !== "select") {
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
            >
                Submit
            </Button>
        </Container>
    );
};

export default InputForm;
