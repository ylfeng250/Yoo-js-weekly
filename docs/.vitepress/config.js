import { defineConfig } from 'vitepress';

import { withSidebar } from 'vitepress-sidebar';

const vitePressOptions = {
  title: 'Yoo JS Weekly',
  description: 'Yoo JS Weekly 静态站点',
  base: '/Yoo-js-weekly/', // 设置为你的仓库名
  themeConfig: {
  },
};

const vitePressSidebarOptions = {
  documentRootPath: '/docs',
  collapsed: false,
  capitalizeFirst: true
};

export default defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions));
