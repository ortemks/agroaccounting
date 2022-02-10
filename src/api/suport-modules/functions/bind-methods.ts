export default function (this: any, objectToBind: { [key: string]: any }) {
    for (let key in objectToBind) {
        if ( typeof objectToBind[key] === 'function' ) {
            objectToBind[key] = objectToBind[key].bind(this)
        }
    }
}