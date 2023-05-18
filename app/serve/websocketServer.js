const WebSocket = require('websocket').server;
const http = require('http');
// 创建一个 HTTP 服务器
const server = http.createServer((request, response) => {
    console.log('收到客户端请求：' + request.url);

    response.writeHead(404);
    response.end();
});

// 绑定 WebSocket 监听到 HTTP 服务器上
const wsServer = new WebSocket({
    httpServer: server,
    autoAcceptConnections: false,
});

module.exports = {
    server,
    wsServer
}
