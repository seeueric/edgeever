# 精工工业建筑系统集团有限公司 · 官网 / Corporate site

中英双语静态站点，无构建步骤、无运行时依赖。整个目录可直接上传到任意静态托管
（Cloudflare Pages、对象存储、nginx）。

- 中文：`/`
- English：`/en/`

> ⚠️ **站内所有文字、经营数据与工程案例均为占位样例**，用于确定结构与视觉。
> 对外发布前必须按下方《上线前必改清单》逐项替换为公司真实信息。

## 设计说明

视觉参照国际工业制造商（Kingspan、Lindab、Astron 一类）的做法，不是国内建站模板的路子：

- **近黑 + 暖白纸色 + 单一铁锈红**（`#15171a` / `#f6f4f1` / `#b23a1b`），不用蓝橙套色
- **直角、无阴影、无渐变**，分隔一律用 1px 发丝线
- **左对齐非对称栅格**（12 栏），小标签在左侧留白栏，正文推到第 5 栏起
- **照片驱动**：全站没有装饰性插画，图形位都是等待替换的实拍图位
- **动效克制**：只有一次性淡入，没有数字滚动、没有视差
- 拉丁字体在前、中文字体兜底，中英文混排时西文走无衬线 Grotesk

## 目录结构

```
sites/jingong/
├── index.html          首页          en/index.html
├── about.html          关于精工      en/about.html
├── business.html       业务领域      en/business.html      锚点 #steel #modular
│                                                          #envelope #bipv #epc #service
├── projects.html       工程业绩      en/projects.html      支持按类型筛选
├── news.html           新闻中心      en/news.html
├── contact.html        联系我们      en/contact.html
├── 404.html            404          en/404.html
├── robots.txt
├── sitemap.xml         中英双语 + hreflang
└── assets/
    ├── css/main.css    全站样式，设计变量集中在文件顶部 :root
    ├── js/main.js      导航、抽屉、淡入、案例筛选、表单校验
    └── img/            Logo 与 favicon（SVG）
```

## 本地预览

页面之间是相对路径，双击也能打开；需要 `/en/` 正常跳转时起一个静态服务器：

```bash
cd sites/jingong
python3 -m http.server 8080      # 或 npx serve .
# http://127.0.0.1:8080  /  http://127.0.0.1:8080/en/
```

## 配图

全站共 **40 个图片位**，目前是带斜纹底的占位块，每块左下角标注了用途。
搜 `data-slot` 可以定位全部。替换方式：把

```html
<div class="fig fig--16x9" data-slot="钢结构制造或吊装实拍位"></div>
```

换成

```html
<img src="assets/img/xxx.jpg" alt="……" width="1600" height="900" loading="lazy">
```

建议尺寸：

| 位置 | 比例 | 建议像素 |
| --- | --- | --- |
| 首页首屏 | 约 16:9 铺满 | 2400×1400，厂区航拍或主体吊装 |
| 全幅横条 | 21:9 | 2800×1200，制造车间或吊装现场 |
| 业务页配图 | 16:9 | 1600×900 |
| 案例缩略图 | 4:3 | 1200×900 |
| 关于页横图 | 21:9 | 2400×1000 |

照片是这套设计的主角。在拿到实拍图之前，站点会明显偏空 —— 这是刻意的，
比用图库图或插画占位更诚实，也更容易看出还缺什么。

## 上线前必改清单

用 `grep -rn "关键字" .` 定位。

- [ ] **电话**（18 处）：`400-000-0000`，同时改 `href="tel:+864000000000"`
- [ ] **邮箱**（32 处）：`contact@example.com`
- [ ] **域名**（112 处）：`www.example.com` —— 涉及 canonical、hreflang、og:url、
      robots.txt、sitemap.xml、首页 JSON-LD
- [ ] **备案号**：页脚 `浙ICP备00000000号`；未备案前先删掉该链接
- [ ] **地址**：中文搜 `请填写`（23 处），英文搜 `to be filled in`（20 处）
- [ ] **公司基本信息**：`about.html` 的「基本信息」表（成立时间、员工规模、产能）
- [ ] **资质等级**：`about.html#honor`，需注明证书编号与有效期
- [ ] **首页数据**：30 年 / 30 万吨 / 1,200 项为示例数字，须核实
- [ ] **发展历程**：`about.html#history` 五个节点均为示例
- [ ] **工程案例**：`projects.html` 九个案例全部虚构。替换为真实项目，并注意
      **未取得业主书面同意前不要公开项目全称与业主名称**
- [ ] **新闻内容**：`news.html` 六条为占位
- [ ] **配图**：见上一节
- [ ] **地图**：`contact.html` 的 `.mapslot` 替换为高德/百度地图
- [ ] **表单后端**：见下节
- [ ] 清理所有 `<!-- TODO -->` 注释（27 处）

## 表单对接

联系页表单**只做前端校验，不发送任何数据**，提交后提示「演示模式」。
逻辑在 `assets/js/main.js` 的 `form()`，搜 `TODO(上线前)`。

接后端时把提示那一行换成 `fetch()`，指向：Cloudflare Worker / 函数计算转发企业邮箱、
企业微信或钉钉机器人、或公司自有 CRM 接口。同时加验证码或频率限制，否则会被机器人刷。

提示文案通过 HTML 上的 `data-msg-invalid` / `data-msg-demo` 传入，中英文各自独立，
改文案不用动 JS。

## 部署

**Cloudflare Pages**：构建命令留空，输出目录 `sites/jingong`。

**nginx**：

```nginx
server {
    listen 80;
    server_name www.example.com;
    root /var/www/jingong;
    index index.html;
    error_page 404 /404.html;
    location ^~ /en/ { error_page 404 /en/404.html; }
    location ~* \.(css|js|svg)$ { expires 7d; }
}
```

**对象存储**：整目录上传，默认首页 `index.html`，404 页 `404.html`。

## 维护说明

- **页面是生成出来的，但仓库里存的是成品 HTML**，可以直接手改，不需要任何工具链。
  代价是页头页脚重复在 14 个文件里 —— 改导航或页脚时 14 个文件都要改，
  或者用 `sed -i` 批量替换。
- **中英文是两套独立文件**。改了中文内容记得同步 `en/` 下的对应页面，
  两边的 DOM 结构必须保持一致，否则 hreflang 对不上。
- **配色与字号集中在 `assets/css/main.css` 顶部的 `:root`**，改品牌色只动那几行。
- 图标是每个页面内联的 SVG sprite（只有三个：箭头、下拉、返回顶部）。

## 已验证

- 响应式：360 / 390 / 768 / 1024 / 1440，14 个页面均无横向溢出
- 无障碍：跳转链接、`aria-expanded` 抽屉、键盘可操作、表单错误可读屏、
  表格 `<caption>` 与 `scope`
- `prefers-reduced-motion`：开启后关闭全部动效
- SEO：每页独立 title/description、canonical、`hreflang` 中英互指 + `x-default`、
  Open Graph，首页带 Organization JSON-LD；sitemap 含双语 alternate
- 打印样式：隐藏导航、页脚与筛选器

## 后续可以做的

- 新闻改为 Markdown 或 CMS 驱动（静态维护多语言新闻会很痛苦）
- 案例详情页（目前案例卡片没有下钻页面）
- 接入统计（Cloudflare Web Analytics / 百度统计）
- 如果要再加语种（日、德、俄），建议此时改用 Astro/Eleventy 等模板方案，
  三语以上手工维护静态文件会失控
