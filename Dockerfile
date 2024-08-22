# Stage 0: 使用 Node.js 16.13.2 作为基础镜像来构建前端项目
FROM node:16.13.2-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 使用淘宝镜像以加快依赖安装速度
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
RUN npm install

# 更新 browserslist 数据库
RUN npx update-browserslist-db@latest

# 将整个项目复制到容器中
COPY . .

# 构建前端项目
RUN npm run build

# Stage 1: 设置运行环境并安装 Node.js 和 Supervisor
FROM centos:7 AS runtime-stage

# 安装 Node.js 和 npm
RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash - && \
    yum install -y nodejs

# 安装 Supervisor
RUN yum install -y epel-release && yum install -y supervisor

# 创建 supervisord 配置目录
RUN mkdir -p /etc/supervisor/conf.d

# 复制 supervisord 配置文件
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 安装 nodemon 用于监控后端项目
RUN npm install -g nodemon

# Stage 2: 使用 Nginx 作为前端服务器
FROM nginx:stable-alpine

# 将前端构建的文件复制到 Nginx 的默认静态资源路径
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制后端项目文件
COPY --from=build-stage /app/serve /app/serve

# 复制 supervisord 配置文件
COPY --from=runtime-stage /etc/supervisor/conf.d/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 安装 Node.js 和 npm（因为你在 CentOS 阶段安装了 Node.js）
RUN apk add --no-cache nodejs npm

# 安装 nodemon 用于监控后端项目
RUN npm install -g nodemon

# 暴露端口
EXPOSE 80
EXPOSE 3000 

# 启动 supervisord 来同时运行 Nginx 和 Nodemon
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
