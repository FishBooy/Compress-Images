<template>
  <div class="setting" :class="className">
    <div class="setting-wrapper">
      <div class="setting-item">
        <van-tag type="primary" color="#91d77b">PNG</van-tag>
        <van-stepper
          v-model="valuePng"
          :button-size="btnSize"
          :step="step"
          :min="min"
          :max="max"
        />
      </div>
      <div class="setting-item">
        <van-tag type="primary">JPEG</van-tag>
        <van-stepper
          v-model="valueJpeg"
          :button-size="btnSize"
          :step="step"
          :min="min"
          :max="max"
          disabled
        />
      </div>
      <div class="setting-item">
        <van-tag type="primary" color="#ed504c">GIF</van-tag>
        <van-stepper
          v-model="valueGif"
          :button-size="btnSize"
          :step="step"
          :min="min"
          :max="max"
          disabled
        />
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
      valuePng: 60,
      valueJpeg: 70,
      valueGif: 80,
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
      if (type === "png") return this.valuePng;
      if (type === "jpeg" || type === "jpg") return this.valueJpeg;
      if (type === "gif") return this.valueGif;
    },
  },
};
</script>

<style lang="less">
.setting {
  height: 0;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;

  .setting-wrapper {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    padding: 10px;
    .setting-item {
      display: flex;
      justify-content: space-between;
    }
  }

  &.visible {
    height: 36px;
    margin-bottom: 15px;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

    .setting-wrapper {
      padding: 10px;
    }
  }
}
</style>