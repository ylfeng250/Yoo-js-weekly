import { defineConfig } from 'vitepress';

import { withSidebar } from 'vitepress-sidebar';

const vitePressOptions = {
  title: 'Yoo JS Weekly',
  description: 'Yoo JS Weekly 静态站点',
  base: '/Yoo-js-weekly/',
  themeConfig: {
    toc: {
      level: [2, 3] 
    }
  },
};

const vitePressSidebarOptions = {
  documentRootPath: '/docs',
  collapsed: false,
  capitalizeFirst: true
};

export default defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions));
