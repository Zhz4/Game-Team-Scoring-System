const {
    server
} = require('./websocketServer')

// 启动 HTTP 服务器
server.listen(3000, () => {
    console.log('服务器已启动，地址为 http://localhost:3000');
});