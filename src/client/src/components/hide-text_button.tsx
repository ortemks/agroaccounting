import { useState } from "react";
import styles from "./hide-text_button.module.scss";
import { IconButton } from "@mui/material";
import { ReactComponent as EyeIcon } from  "../images/eye-icon.svg";
import { ReactComponent as EyeIconFilled } from  "../images/eye-icon_filled.svg";

function HideTextButton(props: {hideTextFunc: (isTextHidden: boolean)=>void}) {
    const [isTextHidden, setIsHidden] = useState<boolean>(false);

    function handleButtonClick() {
        props.hideTextFunc(!isTextHidden);
        setIsHidden(!isTextHidden);
    }

    return (
        <IconButton className={styles.button} onMouseDown={(e)=>e.preventDefault()} onClick={()=>handleButtonClick()}>
            <div className={styles.eyeIconContainer}>
                { isTextHidden ? <EyeIconFilled className={styles.eyeIcon}/>
                : <EyeIcon className={styles.eyeIcon} /> }
            </div>
        </IconButton>
    )
}

export default HideTextButton