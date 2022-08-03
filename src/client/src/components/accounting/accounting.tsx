import { ReactJSXElement, ReactJSXIntrinsicElements } from '@emotion/react/types/jsx-namespace';
import { Component, FunctionComponent, ReactComponentElement, ReactElement } from 'react';
import styles from './accounting.module.scss';

type AccountingType = 'work'|'refueling'|'arrival'|'inventarisation';
type AccountingData = {[key: string]: any};
type AccountingForemostDataKeys<AccountingTypeData> = Partial<keyof AccountingTypeData>[];
type AccountingForemostData<AccountingData> = {
    [key in keyof AccountingData]+?: AccountingData[key]
} 

function AccountingOption(props: {
    size?: {
        width: string,
        height: string
    },
    accountingType: AccountingType,
    accountingData: AccountingData,
    foremostDataKeys: AccountingForemostDataKeys<AccountingData>
}) {
    const accoutingDataList = [] as any;
    for (let key in getFilteredAccountingDataByForeMost(props.accountingData, props.foremostDataKeys)) {
        accoutingDataList.push((
            <div className={styles.accountingDataPeaceWrapper}>
                <span className={styles.accountingDataPeaceKey}>{key}:</span>
                <span className={styles.accountingDataPeaceValue}>{props.accountingData[key]}</span>
            </div>
        ))
    }
    return (
        <div className={styles.accountingWrapper}>
            <div className={styles.accountingTypeLabelWrapper}>
                <span>{props.accountingType}</span>
            </div>
            <div className={styles.accountingDataWrapper}>
                <div className={styles.accountingDatafWindow}>
                    <img src="" alt="" className={styles.accountingIm} />
                    <div className={styles.accountingDataWrapper}>
                        {...accoutingDataList}
                    </div>
                </div>
            </div>
        </div>
    )
}


function getForemostData(accountingData: AccountingData, foremostDataKeys: AccountingForemostDataKeys<AccountingData>) {
    const foremostData = {} as AccountingForemostData<AccountingData>;
    foremostDataKeys.forEach(key => {
        foremostData[key] = accountingData[key];
    })
    return foremostData
}
function getFilteredAccountingDataByForeMost(accountingData: AccountingData, foremostDataKeys: AccountingForemostDataKeys<AccountingData>) {
    const foremostData = getForemostData(accountingData, foremostDataKeys)
    const reversedFilteredObject = {
        ...accountingData,
        ...foremostData
    }
    const filteredObj = {} as AccountingData;
    Object.keys(accountingData).reverse().forEach(key => {
        filteredObj[key] = accountingData[key];
    })
    return filteredObj;
}