class Error {
    public static $isError = true;
    public message: string;
    public value: string;

    constructor(errorMessage: string, value: string) {
        this.message = errorMessage;
        this.value = value;
    }
}

class AuthError extends Error {
    public type = 'Authentication Error';
    constructor(errorMessage:string, value:string) {
        super(errorMessage, value)
    }
}

export default Error

