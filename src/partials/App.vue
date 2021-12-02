<template>
  <div class="container">
    <!--图片上传表单-->
    <div class="upload">
      <h1>Drop your PNG/JPG/JPEG files here!</h1>
      <van-uploader
        :after-read="afterRead"
        :before-read="beforeRead"
        multiple
        :disabled="disabled"
      >
        <van-button icon="add" type="info" :disabled="disabled"
          >选择文件</van-button
        >
      </van-uploader>
      <div class="setting-trigger" @click="toggleSettingForm">
        <van-icon
          name="setting-o"
          size="20"
          :class="`trigger-icon ${className}`"
          @mouseover="toogleClass"
          @mouseleave="toogleClass"
        />
      </div>
    </div>

    <!--压缩参数设置--->
    <Setting ref="setting" />

    <!--压缩图片列表-->
    <div class="list" ref="list">
      <ul v-if="filesList.length">
        <li v-for="(item, index) in filesList" :key="index">
          <p class="file-name">{{ item.name }}</p>
          <p class="file-size">
            <van-tag
              class="original-size"
              v-if="item.size"
              size="medium"
              color="#5d6d7d"
              >{{ formatSize(item.size) }}</van-tag
            >
            <van-tag
              class="reduce-size"
              v-if="item.reduce"
              size="medium"
              type="success"
              >{{ item.reduce }}</van-tag
            >
            <van-tag
              class="current-size"
              v-if="item.minisize"
              size="medium"
              color="#5d6d7d"
              >{{ formatSize(item.minisize) }}</van-tag
            >
          </p>
          <van-button
            v-if="item.path"
            type="info"
            size="mini"
            @click="() => download(item.path)"
            >下载</van-button
          >
          <van-loading v-else color="#1989fa" size="15" />
        </li>
      </ul>
    </div>

    <!--压缩信息合计-->
    <div class="total" v-if="showDownloadAll && filesList.length > 1">
      <div>
        共压缩{{ filesList.length }}张图片，节省了<span class="total-save"
          >{{ totalSaveSize }} 👏👏 <span>{{ totalSavePercent }}!!</span></span
        >
      </div>
      <div class="download-all" @click="downloadAll">下载全部 📦</div>
    </div>
  </div>
</template>

<script>
import Setting from "./Setting.vue";

export default {
  components: {
    Setting,
  },
  data() {
    return {
      filesList: [], // 当前已在本地form读取成功(准备上传压缩)的图片集合
      totalSave: null,
      showDownloadAll: false,
      totalSaveSize: null,
      totalSavePercent: null,
      disabled: true,
      className: "",
    };
  },
  mounted() {
    // 加载页面(首次进入或刷新浏览器)后清除服务端缓存的压缩文件
    this.$request
      .post("/delete/all")
      .then((rsp) => {
        if (rsp.data.code === "OK") this.disabled = false;
      })
      .catch((error) => {
        this.$toast(error);
      });
  },
  methods: {
    toogleClass() {
      this.className = this.className ? "" : "transform";
    },
    // 选取图片后进行格式校验
    beforeRead(files) {
      const allowedTypes = ["jpeg", "jpg", "png"].map(
        (type) => `image/${type}`
      );
      const filesList = Array.isArray(files) ? files : [files];
      const noValidFile = filesList.find(
        (file) => !allowedTypes.includes(file.type)
      );
      if (noValidFile) {
        this.$toast(`${noValidFile.name}不是有效的图片格式！`);
        return false;
      }
      return true;
    },
    // 图片读取成功后进行上传
    afterRead(files) {
      // 读取单个/多个图片成功后更新当前列表信息
      const filesList = files.file
        ? [files.file]
        : Array.from(files).map((file) => file.file);
      const filesListAfterRead = filesList.map((file) => {
        return Object.assign(file, {
          reduce: null,
          minisize: null,
          path: null,
        });
      });
      this.filesList = [...this.filesList, ...filesListAfterRead];

      // 发起上传图片请求
      this.showDownloadAll = false;
      filesListAfterRead.forEach((file) => {
        const formData = new FormData();
        formData.append("file", file);

        const fileType = file.type.split("/")[1];
        if (["jpeg", "jpg", "png"].includes(fileType)) {
          const quality = this.$refs.setting.getQuality(fileType);
          const compressionLevel = this.$refs.setting.getLevel(fileType);

          formData.append("quality", quality);
          formData.append("compressionLevel", compressionLevel);
        }

        if (fileType === "gif") {
          const gifSetting = this.$refs.setting.getGifSetting(fileType);

          formData.append("loop", gifSetting.loop);
          formData.append("delay", gifSetting.delay);
        }

        this.$request
          .post("/minify", formData, {
            headers: { "content-type": "multipart/form-data" },
          })
          .then((rsp) => {
            if (rsp.data.code === "OK") {
              const { info } = rsp.data;

              if (info && info.minisize && info.path) {
                const { minisize, path } = info;

                this.filesList = this.filesList.map((fileItem) => {
                  if (fileItem.name === file.name && !fileItem.path) {
                    const reduce = this.getReduce(minisize, fileItem.size);
                    return Object.assign(fileItem, { minisize, reduce, path });
                  } else {
                    return fileItem;
                  }
                });
              }
            } else {
              this.$toast("Failed！！");
            }

            // 检测是否已经全部压缩成功
            this.checkAllFiles();
          });
      });
    },
    // 下载图片
    download(path) {
      const { list } = this.$refs;
      if (list) {
        const prevIframe = list.querySelector("iframe");
        if (prevIframe) list.removeChild(prevIframe);

        const newIframe = document.createElement("iframe");
        newIframe.setAttribute("src", path);
        list.appendChild(newIframe);
      }
    },
    // 下载所有文件的zip包
    downloadAll() {
      this.$request
        .post("/archive")
        .then((rsp) => {
          if (rsp.data?.path && rsp.data?.code === "OK") {
            this.download(rsp.data.path);
          }
        })
        .catch((error) => console.error(error));
    },
    // 格式化文件size
    formatSize(size, fixed = 2, unit = 1000) {
      if (!size) return "";
      const kb = (size / unit).toFixed(fixed);
      if (kb < unit) return `${kb}KB`;

      const mb = (kb / unit).toFixed(fixed);
      if (mb < unit) return `${mb}MB`;

      return `${kb}KB`;
    },
    // 检查是否所有图片都已经成功压缩
    checkAllFiles() {
      if (this.filesList.every((file) => file.path)) {
        this.showDownloadAll = true;
        const totalSize = this.filesList.reduce(
          (acc, item) => acc + item.size,
          0
        );
        const totalMiniSize = this.filesList.reduce(
          (acc, item) => acc + item.minisize,
          0
        );

        this.totalSaveSize = this.formatSize(totalSize - totalMiniSize);
        this.totalSavePercent = this.getReduce(totalMiniSize, totalSize);
      }
    },
    // 计算单张图片压缩掉的大小
    getReduce(minSize, originalSize) {
      const percentInt = (minSize / originalSize).toFixed(2) * 100;
      return `${(100 - percentInt) * -1}%`;
    },
    // 显示压缩参数配置表单
    toggleSettingForm() {
      this.$refs.setting.toggle();
    },
  },
};
</script>

<style lang="less">
.container {
  width: 60vw;
  height: 100vh;
  padding: 20px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .van-uploader__preview {
    display: none;
  }
  .upload {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #eef6ff;
    border: #3087df 2px dashed;
    border-radius: 5px;
    position: relative;

    .setting-trigger {
      position: absolute;
      right: 10px;
      bottom: 7px;
      cursor: pointer;
      color: #5184b8;
    }
    h1 {
      color: #62666b;
      font-size: 22px;
    }
    .trigger-icon {
      transform: rotate(0);
      transition: transform 0.2s ease-in-out;
    }
    .transform {
      transform: rotate(180deg);
    }
  }
  .list {
    flex-grow: 0;
    flex-shrink: 1;
    overflow-y: auto;
    li {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      align-items: center;
      background: #f6f6f6;
      border: #e6e6e6 1px solid;
      border-radius: 5px;
      padding: 5px;
      color: #434649;
      margin-bottom: 5px;
      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: #eef6ff;
        border: #d5e4f5 1px solid;
      }

      .file-name {
        flex-basis: 40%;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }
      .file-size {
        flex-basis: 40%;
        display: flex;
        align-items: center;
        margin: 0;
        justify-content: center;
        .original-size {
          margin-right: 5px;
        }
        .current-size {
          margin-left: 5px;
        }
        .reduce-size {
          flex-basis: 30px;
          justify-content: center;
        }
      }
    }
    iframe {
      display: none;
    }
  }

  .total {
    display: flex;
    align-items: center;
    margin-top: 15px;
    background: #5e6d7d;
    padding: 10px 5px;
    border-radius: 5px;
    box-shadow: inset 0 0px 5px rgba(0, 0, 0, 0.1);
    font-size: 15px;
    color: #fff;
    justify-content: space-between;
    text-shadow: 0 2px 1px rgba(0, 0, 0, 0.25);

    .total-save {
      font-weight: bold;
      margin: 0 5px;
      span {
        color: #07c160;
        margin-left: 5px;
      }
    }
    .download-all {
      cursor: pointer;
      padding-right: 5px;
    }
  }
}
@media screen and (max-width: 1080px) {
  .container {
    width: auto;
  }
}
</style>