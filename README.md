# 游戏组队计分室
<p align="center">
<a href="https://github.com/Zhz4"><img src="https://img.shields.io/badge/author-zhz4-blue"></a>
<a href="https://cn.vuejs.org/"><img src="https://img.shields.io/badge/language-vue3-yellowgreen"></a>
<a href="https://nodejs.org/download/"><img src="https://img.shields.io/badge/node-16.13.2-brightgreen"></a>
</p>

### 项目简介
😛闲暇时间想做一个游戏组队计分室来巩固前端技能   
😊项目采用了vue3+typecript+websorket开发，为了以后的迭代打下基础   
😍目前计分室仅具备简单的组队计分功能，当然后续的功能正在开发当中，期待一下吧....

### 功能介绍
- 在线人数统计
- 创建房间&加入房间
- 用户自定义分队
- 各个队伍分数统计
- 设置房间最大人数和队伍数
- 用户计分历史记录
- echart图表展示分数排行
- ....

### 待加功能
- 游戏类型（以回合制计分&以倒计时制计分）
- 移动端适配
- 增加用户的互动功能
- 手动修改分队队伍颜色（颜色盘）
- 自定义主题

### 技术选型
| 技术     | 说明     | 官网     |
| -------- | -------- | -------- |
| Vue3 | 前端流行开发框架 | https://cn.vuejs.org |
| Typescript| JavaScript 的一个超集，它最大的优势是提供了类型系统和提高了代码的可读性和可维护性 | https://www.typescriptlang.org/ |
| websorket | 实现实时通信 | http://www.websocket.org/ |
| Vuex | 专为 Vue.js 应用程序开发的状态管理模式 | https://vuex.vuejs.org/zh/guide/ |
| express | Express 是基于 Node.js 平台，快速、开放、极简的Web 开发框架 | https://expressjs.com/ |
| ES6+ | 采用ES6+语法，箭头函数、async/await等等语法很好用 | https://es6.io/ |
| less | 一门 CSS 预处理语言，它扩充了 CSS 语言，增加了诸如变量、混合（mixin）、函数等功能，让 CSS 更易维护、方便制作主题、扩充 | https://lesscss.org/ |

### 环境配置
- node v16.13.2

### 运行项目
1. 前端项目

```shell
cd Game-Team-Scoring-System
npm i
npm run serve
```
2. 后端项目

```shell
cd Game-Team-Scoring-System
npm i
cd serve
nodemon ./top.js
```

### 项目界面
#### PC端
<img src="https://cdn.nlark.com/yuque/0/2023/png/26376404/1686988956580-37445ecc-67d5-4889-bea0-76ceb2392414.png">
<img src="https://cdn.nlark.com/yuque/0/2023/png/26376404/1686987484511-b4ce3dbe-67c6-4c2d-a277-96b91a9d9076.png?x-oss-process=image%2Fresize%2Cw_825%2Climit_0">
<img src="https://cdn.nlark.com/yuque/0/2023/png/26376404/1686988010895-6a56e9b1-7f92-44e1-8016-36e7e29988ac.png?x-oss-process=image%2Fresize%2Cw_825%2Climit_0">

#### 移动端
开发中....

