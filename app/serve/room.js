const url = require('url');
// 存储所有房间的用户连接
let rooms = new Map();

function GroupChart(request) {
    const connection = request.accept(null, request.origin);
    // 获取客户端请求的 URL 和 query 参数
    const {
        pathname,
        search
    } = url.parse(request.httpRequest.url);
    // 将连接对象保存到列表中
    let nickname = search.split('=')[1]
    connection.nickname = nickname

    /**
     * 处理创建新房间事件
     */
    function handleCreateRoom() {
        const roomId = Date.now().toString(); // 使用当前时间戳作为房间号创建新房间
        // 将当前连接加入房间的用户集合中
        // 设置用户类型，0 为房主
        connection.userType = 0
        rooms.set(roomId, {
            people: [],
            // 初始默认房间存6人，分三队
            TeamSetting: {
                peopleCount: 6,
                ranksCount: 3,
                ranksColorList: ['#FF0000', '#00FF00', '#0000FF']
            }
        });
        connection.room = roomId
        connection.sendUTF(JSON.stringify({
            type: "create",
            roomId: roomId,
        }));
    }

    /**
     * 查询指定房间的信息
     * @param data 包含房间id
     */
    function checkRoom(data) {
        const {
            roomId
        } = data;
        connection.sendUTF(JSON.stringify({
            type: "check",
            roomId: roomId,
            member: rooms.get(roomId).people.map(item => {
                return {
                    nickname: item.nickname,
                    userType: item.userType
                }
            }),
            member_size: rooms.get(roomId).people.length
        }));
    }

    /**
     * 处理加入房间事件
     * @param data
     */
    function handleJoinRoom(data) {
        const {
            roomId
        } = data;
        // 设置用户类型，1 为房员
        // 由于新建房间时建立一个空房间然后再加入房间，该用户已经赋为0了，就不需要赋为1了
        if (connection.userType === undefined)
            connection.userType = 1
        // 如果没有该房间就创建该房间
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                people: [],
                // 初始默认房间存6人，分三队
                TeamSetting: {
                    peopleCount: 6,
                    ranksCount: 3,
                    ranksColorList: ['#FF0000', '#00FF00', '#0000FF']
                }
            });
            connection.room = roomId
            connection.userType = 0 // 把该用户设为房主
        }
        if (determineIfTheRoomIsFullyOccupied(roomId)) {
            connection.sendUTF(JSON.stringify({
                type: 'join',
                joinType: 'fullyOccupied',
                msg: '该房间已满员'
            }))
            return;
        }
        // 如果该用户已存在该房间，则不加入
        const isItInThisRoom = rooms.get(roomId).people.some(item => item.nickname === connection.nickname)
        if (isItInThisRoom) {
            console.log('该用户已加入过该房间，请勿重复加入')
            connection.sendUTF(JSON.stringify({
                type: "join",
                msg: `该用户已加入过该房间，请勿重复加入`,
                roomId: roomId,
                member: rooms.get(roomId).people.map(item => {
                    return {
                        nickname: item.nickname,
                        userType: item.userType
                    }
                }),
                member_size: rooms.get(roomId).people.length
            }));
            return
        }
        rooms.get(roomId).people.push(connection);
        connection.room = roomId
        console.log(`目前在房间${roomId}的人数为` + rooms.get(roomId).people.length)
        rooms.get(roomId).people.forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: "join",
                    roomId: roomId,
                    member: rooms.get(roomId).people.map(item => {
                        return {
                            nickname: item.nickname,
                            userType: item.userType
                        }
                    }),
                    TeamSetting: rooms.get(roomId).TeamSetting,
                    member_size: rooms.get(roomId).people.length
                }));
            }
        })
    }

    /**
     * 判断房间是否满员
     * @param roomId 房间Id
     */
    function determineIfTheRoomIsFullyOccupied(roomId) {
        const currentNumberOfPeople = rooms.get(roomId).people.length
        const numberOfRoomsSet = Number(rooms.get(roomId).TeamSetting.peopleCount)
        return currentNumberOfPeople >= numberOfRoomsSet;
    }

    /**
     * 处理退出房间
     */
    function handleOut() {
        const roomId = connection.room
        const nickname = connection.nickname
        if (!connection.room || rooms.size === 0) {
            return
        }
        if (rooms.get(roomId).people.length === 1) {
            // 房间里只有一个人且退出该房间时，该房间删除
            rooms.delete(roomId)
            console.log('房间里只有一个人且退出该房间时，该房间删除')
        } else {
            // 房间里大于一个人时，只将该用户移除
            const room_people = rooms.get(roomId).people.filter(item => item.nickname !== nickname)
            const room = rooms.get(roomId);
            const updatedRoom = {
                ...room,
                people: room_people
            };
            rooms.set(roomId, updatedRoom);
            checkIfItIsTheHomeowner(connection, roomId)
            // 遍历所有客户端连接，向每个客户端发送消息
            rooms.get(roomId).people.forEach(function (connection) {
                // 忽略发送消息的客户端，避免消息被重复发送
                if (connection !== this) {
                    connection.sendUTF(JSON.stringify({
                        type: "delete",
                        msg: `${nickname}退出该房间`,
                        member: rooms.get(roomId).people.map(item => {
                            return {
                                nickname: item.nickname,
                                userType: item.userType
                            }
                        }),
                        member_size: rooms.get(roomId).people.length
                    }));
                }
            }, this);
        }
        connection.userType = 1 // 退出后就没有房主身份了
        try {
            console.log(`房间人数为${rooms.get(roomId).people.length}`)
        } catch (e) {
            console.log('房间人数为0');
        }
    }

    /**
     * 检测退出房间的是否为房主，是则随机赋下一位房员为房主，房员则不理
     * @param conn 连接对象
     * @param roomId 房间Id
     */
    function checkIfItIsTheHomeowner(conn, roomId) {
        const userType = conn.userType
        if (userType === 0) { // 若是房主，则随机赋给下一位
            rooms.get(roomId).people[0].userType = 0
        }
    }

    /**
     * 处理分队设置
     * @param roomId 房间id
     * @param TeamSetting 设置信息
     */
    function handleTeamSettings(roomId, TeamSetting) {
        // 设置房间号，设置人数
        const room = rooms.get(roomId)
        room.TeamSetting = TeamSetting
        // 发送通知
        room.people.forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: 'setUp',
                    nickname: connection.nickname,
                    data: room.TeamSetting,
                    msg: '设置好了新的房间信息'
                }))
            }
        })
    }

    // function handleTeam(){
    //
    // }

    /**
     * 处理发送消息事件
     * @param data
     */
    function handleMessage(data) {
        const {
            roomId,
            msg
        } = data;
        const room = rooms.get(roomId);
        if (!room) {
            connection.sendUTF(
                JSON.stringify({
                    type: "error",
                    msg: `房间 ${roomId} 不存在`
                })
            );
            return;
        }

        for (let client of room) {
            client.sendUTF(JSON.stringify({
                type: "message",
                msg
            }));
        }
    }

    /**
     * 监听消息
     */
    connection.on("message", function (event) {
        const data = JSON.parse(event.utf8Data);
        if (data.type === "join") {
            handleJoinRoom(data);
        } else if (data.type === "message") {
            handleMessage(data);
        } else if (data.type === "create") {
            handleCreateRoom();
        } else if (data.type === "check") {
            checkRoom(data)
        } else if (data.type === 'out') {
            handleOut()
        } else if (data.type === 'setUp') {
            handleTeamSettings(data.roomId, data.TeamSetting)
        }
    });
    connection.on("close", function (event) {
        handleOut()
    });
}

module.exports = {
    GroupChart
}