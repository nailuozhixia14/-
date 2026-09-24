# 塔罗秘境（Arcana）项目约定

## 项目概述
一个纯前端、可本地离线运行的塔罗牌抽牌小游戏。包含完整 78 张塔罗牌与卡背图片资源，以及跟随鼠标运动的星光粒子、光晕、视差、卡牌 3D 倾斜等特效。

## 技术栈
- HTML5 / CSS3 / 原生 JavaScript（无框架、无构建步骤）
- Node.js（仅用于 `tools/generate-cards.js` 一次性生成 SVG 图片资源）
- SVG 作为图片资源格式（矢量、清晰、离线可用）
- Windows 批处理（`启动塔罗秘境.bat`）用于一键打开独立桌面窗口

## 目录结构
- `index.html` 页面入口
- `启动塔罗秘境.bat` 一键桌面窗口启动器（Edge/Chrome 应用模式）
- `css/style.css` 全部样式与动画
- `js/deck.js` 卡牌数据（78 张牌含义、正逆位解读、图片路径）
- `js/effects.js` 鼠标粒子、光晕、视差、3D 倾斜特效
- `js/main.js` 游戏流程（单张 / 三牌阵 / 凯尔特十字）
- `tools/generate-cards.js` 生成卡牌 SVG 的脚本
- `images/` 卡牌图片资源（`card-back.svg` 与 `cards/*.svg`）

## 运行方式
1. 双击 `启动塔罗秘境.bat` 以独立窗口运行，或直接用浏览器打开 `index.html`。
2. 重新生成图片资源：`node tools/generate-cards.js`，会覆写 `images/cards/*.svg` 与 `images/card-back.svg`。

## 约定
- 默认使用中文交流与中文界面文案。
- 纯静态资源，禁止引入外部 CDN 或网络依赖，保证离线可用。
- 启动脚本依赖项目目录路径不含空格；含空格时改用浏览器直接打开 `index.html`。
- 修改卡牌含义或牌名时，同步检查 `js/deck.js` 与 `tools/generate-cards.js` 两处是否一致。
- 修改图片生成脚本后必须运行一次并人工抽查生成结果。
- 保持无构建、无框架、双击即玩的最低运行门槛。