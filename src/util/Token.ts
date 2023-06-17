export function checkToken(){
    // 获取浏览器中存储的 token
    const token = localStorage.getItem('token');
    return !!token;
}
