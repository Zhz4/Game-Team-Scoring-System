const url = require('url');
const { v4: uuidv4 } = require('uuid');
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
        // TODO 创建房间
        const roomId = Date.now().toString(); // 使用当前时间戳作为房间号创建新房间
        // 将当前连接加入房间的用户集合中
        // 设置用户类型，0 为房主
        connection.userType = 0
        rooms.set(roomId, {
            people: [],
            // 历史记录
            historicalRecordList: [],
            // 初始默认房间存6人，分三队
            TeamSetting: {
                peopleCount: 6,
                ranksCount: 3,
                ranksColorList: [{
                    id: uuidv4(),
                    name: '苹果队',
                    color: 'rgba(30, 144, 255, 1)',
                    score: 0,
                    member: []
                }, {
                    id: uuidv4(),
                    name: '香蕉队',
                    color: 'rgba(199, 21, 133, 1)',
                    score: 0,
                    member: []
                }, {
                    id: uuidv4(),
                    name: '橘子队',
                    color: 'rgba(255, 120, 0, 1)',
                    score: 0,
                    member: []
                }]
            }
        });
        connection.room = roomId
        connection.ranks = ''
        connection.sendUTF(JSON.stringify({
            type: "create",
            roomId: roomId,
        }));
    }

    /**
     * TODO 查询指定房间的信息
     * @param data 包含房间id
     */
    function checkRoom(data) {
        const {
            roomId
        } = data;
        connection.sendUTF(JSON.stringify({
            type: "check",
            roomId: roomId,
            TeamSetting: rooms.get(roomId).TeamSetting,
            member: rooms.get(roomId).people.map(item => {
                return {
                    nickname: item.nickname,
                    userType: item.userType,
                    rank: item.ranks
                }
            }),
            member_size: rooms.get(roomId).people.length
        }));
    }

    /**
     * TODO 处理加入房间事件
     * @param data
     */
    function handleJoinRoom(data) {
        // TODO 加入房间
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
                // 历史记录
                historicalRecordList: [],
                // 初始默认房间存6人，分三队
                TeamSetting: {
                    peopleCount: 6,
                    ranksCount: 3,
                    // '#FF0000', '#00FF00', '#0000FF'
                    ranksColorList: [{
                        id: uuidv4(),
                        name: '苹果队',
                        color: 'rgba(30, 144, 255, 1)',
                        score: 0,
                        member: []
                    }, {
                        id: uuidv4(),
                        name: '香蕉队',
                        color: 'rgba(199, 21, 133, 1)',
                        score: 0,
                        member: []
                    }, {
                        id: uuidv4(),
                        name: '橘子队',
                        color: 'rgba(255, 120, 0, 1)',
                        score: 0,
                        member: []
                    }]
                }
            });
            connection.room = roomId
            connection.ranks = ''
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
                        userType: item.userType,
                        rank: item.ranks
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
                            userType: item.userType,
                            rank: item.ranks
                        }
                    }),
                    TeamSetting: rooms.get(roomId).TeamSetting,
                    member_size: rooms.get(roomId).people.length
                }));
            }
        })
    }

    /**
     * TODO 判断房间是否满员
     * @param roomId 房间Id
     */
    function determineIfTheRoomIsFullyOccupied(roomId) {
        const currentNumberOfPeople = rooms.get(roomId).people.length
        const numberOfRoomsSet = Number(rooms.get(roomId).TeamSetting.peopleCount)
        return currentNumberOfPeople >= numberOfRoomsSet;
    }


    /**
     * TODO 清空用户的组队信息
     * @param {房间Id} roomId
     */
    function clearUserSTeamingInformation(roomId) {
        connection.ranks = ''
        const nickname = connection.nickname
        rooms.get(roomId).TeamSetting.ranksColorList.forEach(item => {
            const index = item.member.indexOf(nickname);
            if (index !== -1) {
                item.member.splice(index, 1);
            }
        });
    }

    /**
     * TODO 处理退出房间
     */
    function handleOut() {
        const roomId = connection.room
        const nickname = connection.nickname
        if (!connection.room || rooms.size === 0) {
            return
        }
        clearUserSTeamingInformation(roomId)
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
                        TeamSetting: rooms.get(roomId).TeamSetting,
                        member: rooms.get(roomId).people.map(item => {
                            return {
                                nickname: item.nickname,
                                userType: item.userType,
                                rank: item.ranks
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
     * TODO 检测退出房间的是否为房主，是则随机赋下一位房员为房主，房员则不理
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
     * TODO 处理分队设置
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

    /**
     * TODO 选择队伍
     * @param color
     * @param id 队伍id
     * @param roomId 房间Id
     */
    function selectTeam(color,id, roomId) {
        const nickname = connection.nickname;
        clearUserSTeamingInformation(roomId)
        rooms.get(roomId).TeamSetting.ranksColorList
        const room_teamSetting = rooms.get(roomId).TeamSetting.ranksColorList.find(item => item.id === id)
        const member_set = new Set(room_teamSetting.member)
        member_set.add(nickname)
        // room_teamSetting.member.add(nickname)
        room_teamSetting.member = Array.from(member_set)
        connection.ranks = id
        // 房间内广播通知
        rooms.get(roomId).people.forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: 'selectTeam',
                    TeamSetting: rooms.get(roomId).TeamSetting
                }))
            }
        })
    }

    /**
     * TODO 设置分数
     * @param {所加分数} score
     * @param {房间Id} roomId
     */
    function addScore(score, roomId) {
        // 该用户所在的队伍
        const ranks = connection.ranks
        // 记录并存储历史记录
        storeHistoricalRecord(roomId, score)
        // 在原来分数的基础上加分
        rooms.get(roomId).TeamSetting.ranksColorList.forEach(item => {
            if (item.id === ranks) {
                item.score += score
                return false;
            }
        })
        // 返回到前端该房间的所有用户
        rooms.get(roomId).people.forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: 'addScore',
                    TeamSetting: rooms.get(roomId).TeamSetting,
                    HistoricalRecord: rooms.get(roomId).historicalRecordList
                }))
            }
        })
    }
    /**
     * TODO 处理发送消息事件
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
     * TODO 游戏的开始与结束
     * @param {类型,0结束游戏,1开始游戏,2暂停游戏} type
     * @param {房间Id} roomId
     */
    function theBeginningAndEndOfTheGame(Gtype, roomId) {
        const typeArray = ['结束比赛', '开始比赛', '暂停比赛']
        // 开始或暂停比赛则通知房间内成员
        // 开始比赛后不能更换队伍，暂停比赛可以更换队伍
        if (Gtype === 1 || Gtype === 2) {
            rooms.get(roomId).people.forEach(function (connection) {
                if (connection !== this) {
                    connection.sendUTF(JSON.stringify({
                        type: 'theBeginningAndEndOfTheGame',
                        msg: typeArray[Gtype],
                        Gtype: Gtype,
                    }))
                }
            })
        }
        // 结束比赛则清空分数信息，并且可以更换队伍
        // 组队信息不需要清空
        if (Gtype === 0) {
            rooms.get(roomId).TeamSetting.ranksColorList.forEach(item => {
                item.score = 0
            })
            rooms.get(roomId).historicalRecordList = []
            rooms.get(roomId).people.forEach(function (connection) {
                if (connection !== this) {
                    connection.sendUTF(JSON.stringify({
                        type: 'theBeginningAndEndOfTheGame',
                        msg: typeArray[Gtype],
                        Gtype: Gtype,
                        TeamSetting: rooms.get(roomId).TeamSetting,
                        historicalRecordList:rooms.get(roomId).historicalRecordList
                    }))
                }
            })
        }


    }

    /**
     * TODO 修改队伍设置
     * @param {房间id} roomId
     * @param {队伍id} id
     * @param {队伍名称} name
     * @param {队伍颜色} color
     */
    function changeTeamSetUp(roomId, id, name,color) {
        connection.ranks = id
        rooms.get(roomId).TeamSetting.ranksColorList.forEach(item => {
            if (item.id === id) {
                item.name = name
                item.color = color
                return false;
            }
        })
        rooms.get(roomId).people.forEach(function (connection) {
            if (connection !== this) {
                connection.sendUTF(JSON.stringify({
                    type: 'changeTeamName',
                    TeamSetting: rooms.get(roomId).TeamSetting
                }))
            }
        })
    }

    /**
     * TODO 记录历史记录
     * @param {房间id} roomId
     * @param {用户名} nickname
     * @param {分数} score
     */
    function storeHistoricalRecord(roomId, score) {
        const nickname = connection.nickname
        // 队伍id
        const ranks = connection.ranks
        // 队伍颜色
        const color = rooms.get(roomId).TeamSetting.ranksColorList.filter(item => item.id === ranks)[0].color
        // 获取队伍名称
        const ranksName = rooms.get(roomId).TeamSetting.ranksColorList.filter(item => item.id === ranks)[0].name
        // 获取旧的历史记录
        const historicalRecordList = rooms.get(roomId).historicalRecordList
        // 获取当前时间
        const date = new Date()
        // 时间转换为xx:xx:xx格式
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        // 获取当前记录
        const currentRecord = {
            nickname: nickname,
            score: score,
            time: time,
            color:color,
            ranksName:ranksName
        }
        // 将当前记录添加到历史记录中
        historicalRecordList.push(currentRecord)
        // 更新历史记录
        rooms.get(roomId).historicalRecordList = historicalRecordList
    }

    /**
     * TODO 监听消息
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
        } else if (data.type === 'selectTeam') {
            selectTeam(data.color,data.id, data.roomId)
        } else if (data.type === 'addScore') {
            addScore(data.score, data.roomId)
        } else if (data.type === 'theBeginningAndEndOfTheGame') {
            theBeginningAndEndOfTheGame(data.Gtype, data.roomId)
        } else if(data.type === 'changeTeamSetUp'){
            changeTeamSetUp(data.roomId,data.id,data.name,data.color)
        }
    });
    connection.on("close", function (event) {
        handleOut()
    });
}

module.exports = {
    GroupChart
}
