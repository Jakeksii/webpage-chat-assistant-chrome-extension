import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useState } from "react";
import settings from "./Storage";

export default function Settings({ open, setOpen }) {
    const [values, setValues] = useState(settings.get());

    const handleSubmit = (e) => {
        e.preventDefault();
        settings.save(values);
        setOpen(false)
    }

    return (
        <Dialog open={open}>
            <DialogTitle>ChatGPT API Settings</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} >
                    <Stack spacing={2} padding={2} >
                        <TextField required label="Api Key" variant="outlined" fullWidth type="password" autoComplete="off" value={values.apiKey} onChange={(e) => setValues({ ...values, apiKey: e.target.value })} />
                        <TextField label="Model" variant="outlined" fullWidth value={values.model} onChange={(e) => setValues({ ...values, model: e.target.value })} />
                        <Button type="submit" variant="contained" fullWidth >Save</Button>
                    </Stack>
                </form>
            </DialogContent>
        </Dialog>
    );
}