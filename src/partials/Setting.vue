<template>
  <div class="setting" :class="className">
    <div class="setting-wrapper">
      <div class="setting-item">
        <van-tag type="primary" color="#91d77b">PNG</van-tag>
        <div class="stepper-wrapper">
          <div class="stepper-item">
            <van-tag>色彩质量</van-tag>
            <van-stepper
              v-model="qualityForPng"
              :button-size="btnSize"
              :step="step"
              :min="min"
              :max="max"
            />
            <van-tag
              plain
              type="primary"
              :class="qualityForPng === 60 ? 'visible' : ''"
              >推荐</van-tag
            >
          </div>

          <div class="stepper-item">
            <van-tag>压缩强度</van-tag>
            <van-stepper
              v-model="compressLevelForPng"
              :button-size="btnSize"
              :step="compressLevelForPngStep"
              :min="compressLevelForPngMin"
              :max="compressLevelForPngMax"
            />
            <van-tag
              plain
              type="primary"
              :class="`mark ${compressLevelForPng === 6 ? 'visible' : ''}`"
              >推荐</van-tag
            >
          </div>
        </div>
      </div>
      <div class="setting-item">
        <van-tag type="primary">JPEG</van-tag>
        <div class="stepper-wrapper">
          <div class="stepper-item">
            <van-tag>色彩质量</van-tag>
            <van-stepper
              v-model="qualityForJpeg"
              :button-size="btnSize"
              :step="step"
              :min="min"
              :max="max"
            />
            <van-tag
              plain
              type="primary"
              :class="`mark ${qualityForJpeg === 60 ? 'visible' : ''}`"
              >推荐</van-tag
            >
          </div>
        </div>
      </div>
      <div class="setting-item">
        <!--color="#ed504c"-->
        <van-tag type="primary" color="#b0b0b0">GIF</van-tag>
        <div class="stepper-wrapper">
          <div class="stepper-item">
            <van-tag>循环</van-tag>
            <van-stepper
              v-model="loopForGif"
              :button-size="btnSize"
              :step="loopStep"
              :min="loopMin"
              disabled
            />
            <van-tag
              plain
              type="primary"
              :class="`mark ${loopForGif ? '' : 'visible'}`"
              >无限</van-tag
            >
          </div>
          <div class="stepper-item" style="color: #62666b">
            Not supported yet!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Setting",
  data() {
    return {
      className: "",
      // PNG setting
      qualityForPng: 60,
      compressLevelForPng: 6,
      compressLevelForPngStep: 1,
      compressLevelForPngMin: 0,
      compressLevelForPngMax: 9,

      // JPEG setting
      qualityForJpeg: 60,

      // GIF setting
      loopForGif: 0,
      loopMin: 0,
      loopStep: 1,

      // common options
      btnSize: 22,
      step: 10,
      min: 50,
      max: 100,
    };
  },
  methods: {
    toggle() {
      this.className = this.className ? "" : "visible";
    },
    getQuality(type) {
      if (type === "png") return this.qualityForPng;
      if (type === "jpeg" || type === "jpg") return this.qualityForJpeg;
    },
    getLevel(type) {
      return type === "png" ? this.compressLevelForPng : "";
    },
    getGifSetting() {
      return { loop: this.loopForGif };
    },
  },
};
</script>

<style lang="less">
.setting {
  height: 0;
  overflow: hidden;
  margin: 10px 0;
  border-radius: 5px;
  background: #d0e8ff;
  box-shadow: inset 0px 0px 4px 2px rgb(179 218 255);
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;

  .setting-wrapper {
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: stretch;

    .setting-item {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      margin-right: 10px;
      justify-content: space-between;
      border-radius: 5px;
      background: #fff;
      box-shadow: 0 1px 3px rgb(172 213 255);
      overflow: hidden;
      position: relative;

      &:last-child {
        margin-right: 0;
        opacity: 0.3;
      }

      & > .van-tag {
        border-radius: 0;
        position: absolute;
        left: -30px;
        top: -10px;
        width: 70px;
        height: 36px;
        transform: rotate(-45deg);
        text-align: center;
        line-height: 52px;
        display: block;
        z-index: 10;
      }

      .stepper-wrapper {
        padding: 15px;
        .stepper-item {
          display: flex;
          justify-content: center;
          align-items: stretch;
          margin-bottom: 10px;

          .van-tag {
            &:first-child {
              background: #768495;
              margin-right: 5px;
            }
            &:last-child {
              background: none;
              margin-left: 5px;
              transition: opacity 0.2s ease-in-out;
              opacity: 0;
              border-color: #768495;
              color: #768495;
              &.visible {
                opacity: 1;
              }
            }
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  &.visible {
    height: 105px;
  }
}
</style>