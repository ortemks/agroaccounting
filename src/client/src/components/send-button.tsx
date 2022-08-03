import styles from './send-button.module.scss';
import { ReactComponent as SendIcon } from '../images/send-icon.svg';
import { useState } from 'react';
const SendButton = (props: {onClick: ()=>void}) => {
    const [isSending, setIsSending] = useState(false)

    function handleClick() {
        setIsSending(!isSending);
        props.onClick();
    }
    return (
        <div className={styles.sendButtonLoadingBorder}>
            <button  className={styles.sendButton} onClick={()=>handleClick()}>
                <SendIcon className={styles.sendIcon} />
            </button>
        </div>
    )
}

export default SendButton