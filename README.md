基于 node 服务的图片压缩和下载工具，目前支持图片格式 jpg、png。

#### Powered by

-   **SERVER:** Node(>=12.13) & multer & sharp
-   **FRONT:** Vue & Vant

#### How to use

启动本地 node 服务

```node
npm start
```

在浏览器端访问

```
localhost:8080
```

在浏览器页面中上传(支持拖拽)图片，上传成功后 node 会自动进行压缩打包处理。压缩打包结束后，浏览器中会显示详细的压缩数据，同时支持单张图片下载或所有压缩图的 zip 包下载。如下图所示：

![demo](demo.png)

#### unfixed bugs

-   [ ] uploads、minified、zips 目录在页面载入时确保存在或未存在时创建
-   [ ] uploads 根据 IP 创建上传目录解决多用户并发上传的问题

#### To do next

-   [ ] 删除 vant 引用
-   [ ] 优化 npm script
-   [ ] travis 自动集成部署
