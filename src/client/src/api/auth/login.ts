interface UserCredentials {
    email: string,
    password: string
}
interface UserInfo {
    email: string,
    role: 'administrator'|'accountant'|'chief',
    firm: string[]
}

async function logIn (userCredentials: UserCredentials): Promise<UserInfo|any> {
    const resourceRequested = '/api/users/interactions/login';
    const requestBody = JSON.stringify(userCredentials);
    const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestBody
    }
    const response = await fetch(resourceRequested, requestOptions);
    if (!response.ok) {
        const error = JSON.parse(await response.text());
        throw error
    }
    const userInfo: UserInfo = await response.json();
    return userInfo

}

export default logIn
export type {UserCredentials, UserInfo}