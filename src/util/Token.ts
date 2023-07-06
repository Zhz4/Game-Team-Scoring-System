export function checkToken(){
    // 获取浏览器中存储的 token
    const token = localStorage.getItem('token');
    return !!token;
}

/**
 * 设置用户名
 * @param username 新用户名
 */
export function setUsername(username: string){
    localStorage.setItem('username',username);
}

/**
 * 设置token
 * @param token
 */
export function setToken(token: string){
    localStorage.setItem('token',token);
}

/**
 * 获取token
 */
export function getToken(){
    return localStorage.getItem('token');
}

/**
 * 获取用户名
 */
export function getUsername(){
    return localStorage.getItem('username');
}
