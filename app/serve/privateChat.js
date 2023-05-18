
// 定义连接对象列表
const url = require('url');
const {wsServer} = require('./WebSocketServer')


let connections = [];
let count = 0
// 监听 WebSocket 连接事件
const privateChart = wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    // 获取客户端请求的 URL 和 query 参数
    const {pathname, search} = url.parse(request.httpRequest.url);

    // 将连接对象保存到列表中
    let nickname = search.split('=')[1]
    console.log(nickname + 'WebSocket 连接已建立！');
    connection.nickname = nickname
    connections.push(connection);
    // 遍历所有客户端连接，向每个客户端发送消息
    connections.forEach(function (connection) {
        // 忽略发送消息的客户端，避免消息被重复发送
        if (connection !== this) {
            connection.sendUTF(JSON.stringify({msg:nickname +'已连接',conns:connections.map(item=>item.nickname),type:0}));
        }
    },this);
    console.log(connections.length)
    // 监听 WebSocket 消息事件
    connection.on('message', (message) => {
        console.log('收到消息：' + message.utf8Data);
        console.log(message)
        connection.content = message
        // 从消息中解析出目标用户
        const {to, content} = JSON.parse(message.utf8Data);

        // 查找目标用户的连接对象
        const targetConnection = connections.find(c => c.nickname === to);

        if (targetConnection) {
            // 如果找到了目标用户的连接对象，发送消息
            targetConnection.sendUTF(JSON.stringify({from: connection.nickname, msg:content,type:1}));
        } else {
            // 如果没找到目标用户的连接对象，提示用户不存在
            connection.sendUTF(JSON.stringify({msg: 'User does not exist.',type:3}));
        }
    });

    // 监听 WebSocket 关闭事件
    connection.on('close', (reasonCode, description) => {
        console.log(connection.nickname+'WebSocket 连接已关闭！')
        // 删除连接关闭的对象
        connections = connections.filter(item=>item.nickname !== connection.nickname)
        console.log('删除后连接个数'+connections.length)
    });
});

module.exports = {
    privateChart
}
