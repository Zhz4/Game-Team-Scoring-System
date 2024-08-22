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

# 更新 browserslist 数据库
RUN npx update-browserslist-db@latest

# 将整个项目复制到容器中
COPY . .

RUN npm run build

# 设置运行环境
FROM nginx:stable-alpine AS runtime-stage

# 复制前端构建的文件到 Nginx 的默认静态资源路径
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

# 启动 Nginx
CMD ["sh", "-c", "nginx -g 'daemon off;'"]
