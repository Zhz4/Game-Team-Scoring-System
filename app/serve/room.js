const url = require('url');
// 存储所有房间的用户连接
let rooms = new Map();

function GroupChart(request) {
    const connection = request.accept(null, request.origin);
    // 获取客户端请求的 URL 和 query 参数
    const {pathname, search} = url.parse(request.httpRequest.url);
    // 将连接对象保存到列表中
    let nickname = search.split('=')[1]
    connection.nickname = nickname

    // 处理创建新房间事件
    function handleCreateRoom() {
        const roomId = Date.now().toString(); // 使用当前时间戳作为房间号创建新房间
        // 将当前连接加入房间的用户集合中
        rooms.set(roomId, [connection]);
        connection.room = roomId
        rooms.get(roomId).forEach(function (connection) {
            connection.sendUTF(JSON.stringify({
                type: "create",
                roomId: `新建的房间号为${roomId}`,
                member: rooms.get(roomId).map(item => item.nickname),
                member_size: rooms.get(roomId).length
            }));
        })
    }

    // 处理加入房间事件
    function handleJoinRoom(data) {
        const {roomId} = data;
        if (!rooms.has(roomId)) {
            rooms.set(roomId, []);
        }
        rooms.get(roomId).push(connection);
        connection.room = roomId
        console.log(`目前在房间${roomId}的人数为` + rooms.get(roomId).length)
        rooms.get(roomId).forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: "join", roomId: `加入的房间号为${roomId}`,
                    member: rooms.get(roomId).map(item => item.nickname),
                    member_size: rooms.get(roomId).length
                }));
            }
        })
    }

    // 处理发送消息事件
    function handleMessage(data) {
        const {roomId, msg} = data;
        const room = rooms.get(roomId);
        if (!room) {
            connection.sendUTF(
                JSON.stringify({type: "error", msg: `房间 ${roomId} 不存在`})
            );
            return;
        }

        for (let client of room) {
            client.sendUTF(JSON.stringify({type: "message", msg}));
        }
    }

    connection.on("message", function (event) {
        const data = JSON.parse(event.utf8Data);
        if (data.type === "join") {
            handleJoinRoom(data);
        } else if (data.type === "message") {
            handleMessage(data);
        } else if (data.type === "create") {
            handleCreateRoom();
        }
    });
    connection.on("close", function (event) {
        if (!connection.room) {
            return
        }
        const roomId = connection.room
        const nickname = connection.nickname
        if(rooms.get(roomId).length === 1){
            // 房间里只有一个人且退出该房间时，该房间删除
            rooms.delete(roomId)
        }
        else{
            // 房间里大于一个人时，只将该用户移除
            const room  = rooms.get(roomId).filter(item=> item.nickname !== nickname)
            rooms.set(roomId, room);
            // 遍历所有客户端连接，向每个客户端发送消息
            rooms.get(roomId).forEach(function (connection) {
                // 忽略发送消息的客户端，避免消息被重复发送
                if (connection !== this) {
                    connection.sendUTF(JSON.stringify({
                        type: "delete",
                        msg:`${nickname}退出该房间`,
                        member: rooms.get(roomId).map(item => item.nickname),
                        member_size: rooms.get(roomId).length
                    }));
                }
            }, this);
        }
    });
}

module.exports = {
    GroupChart
}
