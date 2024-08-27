# 使用 Node.js 16.13.2 作为基础镜像
FROM node:16.13.2-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 使用淘宝镜像以加快依赖安装速度
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
RUN npm install

# 将整个项目复制到容器中
COPY . .

# 构建前端项目
RUN npm run build

# 设置运行环境
FROM nginx:stable-alpine AS runtime-stage

# 安装 Node.js 和 npm
RUN apk add --no-cache nodejs npm

# 安装 Supervisor
RUN apk add --no-cache supervisor

# 复制前端构建的文件到 Nginx 的默认静态资源路径
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制后端项目
COPY --from=build-stage /app/serve /app/serve

# 设置工作目录为后端项目目录
WORKDIR /app/serve

COPY package*.json ./

# 使用淘宝镜像以加快依赖安装速度
RUN npm config set registry https://registry.npmmirror.com

RUN npm install && npm install -g pm2

# 复制 Supervisor 配置文件
COPY supervisord.conf /etc/supervisord.conf

# 暴露端口
EXPOSE 80
EXPOSE 3000

# 启动 Supervisor
CMD ["supervisord", "-c", "/etc/supervisord.conf"]