import { useState } from "react";
import styles from "./password-input_field.scss";
import TextField from "@mui/material/TextField";
import HideTextButton from "../hide-text_button";
import validator from "validator";

function PasswordInputField(props: {onChange: (value:string)=>any}) {
    const [textType, setTextType] = useState<'text'|'password'>('text');
    
    function hideText (isTextHidden: boolean) {
        isTextHidden ? setTextType('password') : setTextType('text')
    }
    return (
        <TextField onChange={(event) => props.onChange(event.target.value)} color="secondary" label="password" variant="standard" type={textType} 
        InputProps={{ endAdornment: <HideTextButton hideTextFunc={hideText} /> }} />
    )
}

function EmailInputField(props: {onChange: (value:string, isCorrectEmail: boolean)=>any}) {
    const [fieldColor, setTextColor] = useState<"success"|"error"|"secondary">("secondary");
    
    function isEmailChecker(input: string) {
        validator.isEmail(input) ? setTextColor("success") : setTextColor("error");
        props.onChange(input, validator.isEmail(input))
    }

    return (
        <TextField color={fieldColor} label="email" variant="standard" type="text"  
        onChange={(event) => isEmailChecker(event.target.value)} />
    )
} 

export { PasswordInputField, EmailInputField }