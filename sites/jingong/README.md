# 精工工业建筑系统集团有限公司 · 官网

纯静态站点，无构建步骤、无运行时依赖。用浏览器直接打开 `index.html` 即可查看，
也可以整个目录上传到任意静态托管（Cloudflare Pages、对象存储、nginx）。

> ⚠️ **当前站内所有文字、数据、案例均为占位样例**，用于确定结构与视觉。
> 对外发布前必须按下方《上线前必改清单》逐项替换为公司真实信息。

## 目录结构

```
sites/jingong/
├── index.html          首页
├── about.html          关于精工（简介 / 发展历程 / 企业文化 / 资质荣誉）
├── business.html       业务领域（六个板块，带页内锚点 #steel #prefab #envelope #bipv #epc #service）
├── projects.html       工程业绩（支持按项目类型筛选）
├── news.html           新闻中心
├── contact.html        联系我们（含咨询表单）
├── 404.html            404 页
├── robots.txt          搜索引擎抓取规则
├── sitemap.xml         站点地图
└── assets/
    ├── css/main.css    全站样式（设计变量集中在文件顶部 :root）
    ├── js/main.js      导航、滚动动效、数字滚动、案例筛选、表单校验
    └── img/            Logo 与 favicon（SVG）
```

## 本地预览

因为页面之间是相对路径，直接双击打开也能用；需要更接近线上环境时起一个静态服务器：

```bash
cd sites/jingong
python3 -m http.server 8080      # 或 npx serve .
# 打开 http://127.0.0.1:8080
```

## 上线前必改清单

按顺序处理，改完把本节勾掉。括号内是全站出现次数，可用 `grep -rn "关键字" .` 定位。

- [ ] **联系电话**（21 处）：替换 `400-000-0000`，同时改 `href="tel:+864000000000"`
- [ ] **邮箱**（30 处）：替换 `contact@example.com`
- [ ] **域名**（24 处）：替换 `www.example.com`，涉及 `canonical`、`og:url`、`robots.txt`、`sitemap.xml`、首页 JSON-LD
- [ ] **备案号**（7 处）：替换页脚 `浙ICP备00000000号`，未备案前先删掉该链接
- [ ] **公司地址 / 制造基地地址**：搜 `请填写`，共 12 处
- [ ] **资质等级**：`about.html#honor` 中 4 处 `待填写`，需注明证书编号与有效期
- [ ] **首页数据**：`index.html` 里的 `data-count`（30 年 / 30 万吨 / 1200 项 / 20 个国家）为示例数字，须由市场部核实
- [ ] **发展历程年份**：`about.html#history` 五个节点均为示例，替换为真实沿革
- [ ] **工程案例**：`projects.html` 九个案例全部为虚构。替换为真实项目，并注意：
      **未取得业主书面同意前不要公开项目全称与业主名称**
- [ ] **新闻内容**：`news.html` 六条为占位
- [ ] **表单后端**：见下节
- [ ] **地图**：`contact.html` 的 `.map-placeholder` 替换为高德/百度地图的 iframe 或 JS API
- [ ] **配图**：目前所有图形都是内联 SVG 线稿，没有用任何照片。有实拍图后可替换
      Hero 右侧示意图与案例卡片的 `.case__media`
- [ ] 清理所有 `<!-- TODO -->` 注释（22 处）

## 表单对接

`contact.html` 的表单目前**只做前端校验，不发送任何数据**，提交后只提示"演示模式"。
逻辑在 `assets/js/main.js` 的 `initForm()`，搜 `TODO(上线前)`。

接后端时把那一行换成 `fetch()`，指向任意一种：

- Cloudflare Worker / 函数计算，转发到企业邮箱或钉钉、企业微信机器人
- 现成表单服务
- 公司自有 CRM 接口

注意同时加上防滥用措施（验证码或频率限制），否则容易被表单机器人刷。

## 部署

**Cloudflare Pages**：构建命令留空，输出目录填 `sites/jingong`。

**nginx**：

```nginx
server {
    listen 80;
    server_name www.example.com;
    root /var/www/jingong;
    index index.html;
    error_page 404 /404.html;
    location ~* \.(css|js|svg)$ { expires 7d; }
}
```

**对象存储**：整个目录上传，把默认首页设为 `index.html`、404 页设为 `404.html`。

## 维护说明

- **页头和页脚是复制在 6 个 HTML 文件里的**（静态站点没有模板机制）。
  改导航、电话、页脚链接时，记得 6 个文件都改，或用 `sed -i` 批量替换。
- **配色和字号集中在 `assets/css/main.css` 顶部的 `:root`**，改品牌色只需要动那几行变量。
- 图标是文件底部内联的 SVG sprite（`<symbol>`），新增图标加一个 `<symbol id="i-xxx">`
  再用 `<use href="#i-xxx"/>` 引用。同样 6 个文件都要加。

## 已做的适配

- 响应式：360 / 390 / 768 / 1024 / 1440 均无横向溢出
- 无障碍：跳转链接、`aria-expanded` 导航、键盘可操作、表单错误提示可读屏
- `prefers-reduced-motion`：开启后关闭所有动效
- SEO：每页独立 title/description、canonical、Open Graph，首页带 Organization JSON-LD
- 打印样式：打印时隐藏导航、页脚与 CTA

## 后续可以做的

- 新闻改成 Markdown 或 CMS 驱动（内容多了以后静态维护会很痛苦）
- 加英文版 `/en/`（面向出口业务）
- 案例详情页（目前案例卡片没有下钻页面）
- 接入统计（百度统计 / Google Analytics / Cloudflare Web Analytics）
