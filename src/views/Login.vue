<template>
  <div class="login-page" :style="{ 'background-image': 'url(' + require('@/assets/bg.jpeg') + ')' }">
    <h3
      style="
        margin: 70px 0 40px;
        text-align: center;
        font-size: 30px;
        line-height: 36px;
        color:#fff;
      "
    >
      4P WMS
    </h3>
    <van-form>
      <van-field
        v-model.trim="username"
        name="Account"
        label=""
        placeholder="Account"
        :rules="[{ required: true, message: 'Please fill in the username' }]"
      />
      <van-field
        style
        v-model.trim="password"
        type="password"
        name="Password"
        label=""
        placeholder="Password"
        @keyup.enter="submit"
        :rules="[
          { required: true, message: 'Please fill in the password' },
          { validator: validator, message: 'Password must have at least 6 digits' },
        ]"
      />
      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">Sign In</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { login } from "@/api/index.js";
import { encrypt } from "@/utils/jsencrypt";
export default {
  data() {
    return {
      username: "wms",
      password: "123456",
      deviceId:"",// 设备ID
    };
  },
  methods: {
    validator(val) {
      return val.length >= 6;
    },
    submit() {
      let that = this;
      if (this.username.trim().length > 0 && this.password.trim().length >= 6) {
        // sessionStorage.removeItem("wmsToken");
        let password=encrypt(this.password)
        login(this.username, password,"none", this.deviceId).then(res => {
          // sessionStorage.setItem("wmsToken", res.token_type +" "+res.access_token);
          let expiresIn = new Date(new Date().getTime() + res.expires_in * 1000);
          Cookies.set("wms-admin-Token", res.token_type +" "+res.access_token, {expires: expiresIn});
          Cookies.set("wms-admin-Refresh-Token", res.refresh_token, {expires: new Date(new Date().getTime() + 600000 * 1000)});
          Cookies.set("wms-admin-Expires-In", expiresIn, {expires: expiresIn});
          that.$router.push({ name: "Home" })
        })
      }
    },
  },
  created() {
    if (!sessionStorage.getItem("deviceId")) {
      this.deviceId = Math.random();
      sessionStorage.setItem("deviceId", this.deviceId);
    } else {
      this.deviceId = sessionStorage.getItem("deviceId");
    }
  },
  mounted() {},
};
</script>

<style lang="scss">
.login-page {
  position: relative;
  padding: 5%;
  height:100vh;
  .fixedBox {
    font-size: 16px;
  }
}
</style>
