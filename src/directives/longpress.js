export default {
  name: "longpress", // 指令名
  instance: {
    bind(el, binding, vnode) {
      let isiOS = /iphone/gi.test(navigator.userAgent);
      const iosUnable = binding.value.iosUnable || false;
      if (isiOS && iosUnable) {
        return;
      }
      var timer = null;
      vnode.start = function (e) {
        // 如果是点击事件，不启动计时器，直接返回
        if (e.type === "click") {
          return;
        }
        if (timer == null) {
          // 创建定时器 ( value.time ms之后执行长按功能函数 )
          timer = setTimeout(function () {
            //执行长按功能函数
            binding.value.cb();
          }, binding.value.time);
        }
      };
      vnode.cancel = function () {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
      };

      // 添加事件监听器
      el.addEventListener("mousedown", vnode.start);
      el.addEventListener("touchstart", vnode.start);

      // 取消计时器
      el.addEventListener("click", vnode.cancel);
      el.addEventListener("touchmove", vnode.cancel);
      el.addEventListener("mouseout", vnode.cancel);
      el.addEventListener("touchend", vnode.cancel);
      el.addEventListener("touchcancel", vnode.cancel);
    },
    unbind(el, binding, vnode) {
      // 添加事件监听器
      el.removeEventListener("mousedown", vnode.start);
      el.removeEventListener("touchstart", vnode.start);

      // 取消计时器
      el.removeEventListener("click", vnode.cancel);
      el.removeEventListener("touchmove", vnode.cancel);
      el.removeEventListener("mouseout", vnode.cancel);
      el.removeEventListener("touchend", vnode.cancel);
      el.removeEventListener("touchcancel", vnode.cancel);
    }
  }
};