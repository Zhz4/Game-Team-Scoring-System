# 使用 Node.js 16.13.2 作为基础镜像
FROM node:16.13.2-alpine

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

# 安装 `supervisord`
RUN apk add --no-cache supervisor

# 创建 supervisord 配置文件
RUN mkdir -p /etc/supervisor/conf.d
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 使用 Nginx 作为前端服务器
FROM nginx:stable-alpine

# 将前端构建的文件复制到 Nginx 的默认静态资源路径
COPY --from=0 /app/dist /usr/share/nginx/html

# 复制后端项目
COPY --from=0 /app/serve /app/serve

# 复制 supervisord 配置文件
COPY --from=0 /etc/supervisor/conf.d/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 安装 nodemon 用于监控后端项目
RUN npm install -g nodemon

# 暴露端口
EXPOSE 80
EXPOSE 3000 

# 启动 supervisord 来同时运行 Nginx 和 Nodemon
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
