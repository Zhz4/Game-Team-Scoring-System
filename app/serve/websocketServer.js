const WebSocket = require('websocket').server;
const http = require('http');
const {privateChart} = require("./privateChat");
const {GroupChart} = require("./room");
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

wsServer.on('request',(request)=>{
    // 根据 URL 参数来判断客户端想要连接到哪个 WebSocket 服务端点
    const url = request.httpRequest.url
    const path = url.split('?')[0]
    console.log(path)
    if (path === '/privateChart') {
        privateChart(request);
    } else if (path === '/groupChart') {
        GroupChart(request)
    }
})


module.exports = {
    server
}
