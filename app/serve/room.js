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
                roomId: roomId,
                member: rooms.get(roomId).map(item => item.nickname),
                member_size: rooms.get(roomId).length
            }));
        })
    }

    // 查询指定房间的信息
    function checkRoom(data){
        const {roomId} = data;
        connection.sendUTF(JSON.stringify({
            type: "check",
            roomId: roomId,
            member: rooms.get(roomId).map(item => item.nickname),
            member_size: rooms.get(roomId).length
        }));
    }

    // 处理加入房间事件
    function handleJoinRoom(data) {
        const {roomId} = data;
        // 如果没有该房间就创建该房间
        if (!rooms.has(roomId)) {
            rooms.set(roomId, []);
        }
        // 如果该用户已存在该房间，则不加入
        const isItInThisRoom = rooms.get(roomId).some(item =>item.nickname === connection.nickname)
        if(isItInThisRoom){
            console.log('该用户已加入过该房间，请勿重复加入')
            connection.sendUTF(JSON.stringify({
                type: "join",
                msg: `该用户已加入过该房间，请勿重复加入`,
                member: rooms.get(roomId).map(item => item.nickname),
                member_size: rooms.get(roomId).length
            }));
            return
        }
        rooms.get(roomId).push(connection);
        connection.room = roomId
        console.log(`目前在房间${roomId}的人数为` + rooms.get(roomId).length)
        rooms.get(roomId).forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: "join",
                    roomId: roomId,
                    member: rooms.get(roomId).map(item => item.nickname),
                    member_size: rooms.get(roomId).length
                }));
            }
        })
    }

    /**
     * 处理退出房间
     */
    function handleOut(){
        if (!connection.room) {
            return
        }
        const roomId = connection.room
        const nickname = connection.nickname
        if(rooms.get(roomId).length === 1){
            // 房间里只有一个人且退出该房间时，该房间删除
            rooms.delete(roomId)
            console.log('房间里只有一个人且退出该房间时，该房间删除')
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
            console.log('join')
            handleJoinRoom(data);
        } else if (data.type === "message") {
            console.log('message')
            handleMessage(data);
        } else if (data.type === "create") {
            console.log('create')
            handleCreateRoom();
        }else if(data.type === "check"){
            checkRoom(data)
        }else if(data.type === 'out'){
            handleOut()
        }
    });
    connection.on("close", function (event) {
        handleOut()
    });
}

module.exports = {
    GroupChart
}
