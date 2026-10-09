import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 后端地址来自环境变量，开发态默认走 ruoyi-vue-pro 的本地端口 48080
const apiTarget = process.env.VITE_API_TARGET ?? 'http://127.0.0.1:48080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 显式绑 IPv4：Vite 传 'localhost' 时在 Windows 上只会监听 [::1]，
    // 导致用 127.0.0.1 访问的客户端（预览面板、部分脚本）连接被拒绝。
    // 不要用 true / '0.0.0.0'，那会把开发服务器暴露到局域网。
    host: '127.0.0.1',
    proxy: {
      // 走 Vite 代理，避免开发态的跨域配置
      '/app-api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/admin-api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
