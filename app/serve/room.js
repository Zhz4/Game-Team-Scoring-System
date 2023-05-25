// 服务器端代码
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 },()=>{
    console.log('服务器已启动，地址为 http://localhost:3001')
});

// 存储所有房间的用户连接
const rooms = new Map();

wss.on("connection", function(ws, req) {
    console.log("WebSocket 连接已建立");

    // 处理创建新房间事件
    function handleCreateRoom() {
        const roomId = Date.now().toString(); // 使用当前时间戳作为房间号创建新房间
        // 将当前连接加入房间的用户集合中
        rooms.set(roomId, new Set([ws]));
        ws.send(JSON.stringify({ type: "create", roomId:`新建的房间号为${roomId}` }));
    }

    // 处理加入房间事件
    function handleJoinRoom(data) {
        const { roomId } = data;
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(ws);
        console.log(`目前在房间${roomId}的人数为`+rooms.get(roomId).size)
        ws.send(JSON.stringify({ type: "join", roomId:`加入的房间号为${roomId}`,member: rooms.get(roomId),member_size:rooms.get(roomId).size}));
    }

    // 处理发送消息事件
    function handleMessage(data) {
        const { roomId, msg } = data;
        const room = rooms.get(roomId);

        if (!room) {
            ws.send(
                JSON.stringify({ type: "error", msg: `房间 ${roomId} 不存在` })
            );
            return;
        }

        for (let client of room) {
            client.send(JSON.stringify({ type: "message", msg }));
        }
    }

    ws.on("message", function(event) {
        const data = JSON.parse(event);

        if (data.type === "join") {
            handleJoinRoom(data);
        } else if (data.type === "message") {
            handleMessage(data);
        } else if (data.type === "create") {
            handleCreateRoom();
        }
    });

    ws.on("close", function() {
        console.log("WebSocket 连接已关闭");
    });
});
