import styles from './pop-up.module.scss'

const PopUp: React.FunctionComponent<{children: JSX.Element, topPadding: string}> = ({children, topPadding}) => {
    return (
        <div className={styles.popUpWrapper}>
            <div className={styles.backgroundBlur}></div>
            <div className={styles.contentWrapper} style={{paddingTop: topPadding}}>
                {children}
            </div>
        </div>
    )
}

export default PopUp