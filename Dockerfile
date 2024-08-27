# 使用 Node.js 16.13.2 作为基础镜像构建前端项目
FROM node:16.13.2-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 复制并安装前端依赖
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

# 构建前端项目
COPY . .
RUN npm run build

# 使用 Node.js 16.13.2 作为基础镜像运行后端服务
FROM node:16.13.2-alpine AS backend-stage

# 设置工作目录
WORKDIR /app/serve

# 复制后端项目文件及依赖文件
COPY --from=build-stage /app/serve /app/serve
COPY --from=build-stage /app/package*.json ./

# 安装后端依赖和 pm2
RUN npm config set registry https://registry.npmmirror.com && npm install && npm install -g pm2

# 使用 Nginx 作为基础镜像来托管前端文件
FROM nginx:stable-alpine AS runtime-stage

# 复制前端构建的文件到 Nginx 的默认静态资源路径
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制后端服务到容器中
COPY --from=backend-stage /app/serve /app/serve

# 安装 Supervisor
RUN apk add --no-cache supervisor

# 复制 Supervisor 配置文件
COPY supervisord.conf /etc/supervisord.conf

# 暴露端口
EXPOSE 80
EXPOSE 3000

# 启动 Supervisor
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
