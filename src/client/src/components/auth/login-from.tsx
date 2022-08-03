import styles from './login-form.module.scss';
import { PasswordInputField, EmailInputField } from './credentials-input_fields';
import PopUp from '../pop-up';
import SendButton from '../send-button';
import logIn, {UserCredentials, UserInfo} from '../../api/auth/login';
import { useState } from 'react';
import { ReactComponent as Logo } from '../../images/logo.svg';

const LoginForm = () => {
    const [userCredentials, setUserCredentials] = useState<UserCredentials>({email: '', password: ''});
    const [isCorrectEmail, setIsCorrectEmail] = useState<Boolean>(false);

    function onPasswordChange (value: string) { 
        setUserCredentials({ ...userCredentials, password: value})
    }
    function onEmailChange (value: string, isCorrectEmail: boolean) {
        setIsCorrectEmail(isCorrectEmail);
        setUserCredentials({...userCredentials, email: value});
    }
    function handleIncorrectEmail () {
        console.log(isCorrectEmail)
        alert('lol')
    }
    async function formHandler () {
        try {
            const userInfo = await logIn(userCredentials);
            console.log(userInfo);
            
        } catch (error) {
            console.log(error)
        }
    }   
    return (
        <PopUp topPadding='20vh'>
            <form className={styles.form} onSubmit={(e)=>e.preventDefault()}>
                <div className={styles.logoWrapper}>
                    <Logo className={styles.logo} />
                </div>
                <div className={styles.credentialsInputWrapper}>
                    <EmailInputField onChange={onEmailChange}/>
                    <PasswordInputField onChange={onPasswordChange}/>
                </div>     
                <div className={styles.sendButtonWrapper}>
                    <SendButton onClick={()=>{}}/>
                </div>
            </form>
        </PopUp>

    )
}

export default LoginForm