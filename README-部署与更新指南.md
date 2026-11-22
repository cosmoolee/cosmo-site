# Cosmo 个人网站：部署与更新指南

这个文件夹就是完整的网站。日常更新作品**不需要改任何代码**，用浏览器打开 `你的域名/admin` 后台操作即可。

---

## 一、第一次上线（只做一次，约 30–60 分钟）

### 1. 注册两个免费账号
- **GitHub**（github.com）：存放网站文件。
- **Netlify**（netlify.com）：把网站发布到网上。注册时选 "Sign up with GitHub"，直接用 GitHub 账号登录最省事。

### 2. 把网站文件放到 GitHub
1. 登录 GitHub，右上角 **+** → **New repository**。
2. Repository name 填 `cosmo-site`，选 **Public**，点 **Create repository**。
3. 在新页面点 **uploading an existing file**。
4. 打开解压后的 `cosmo-site` 文件夹，**全选里面的所有文件和文件夹**（不是文件夹本身），拖进网页。
5. 等上传完成，点底部的 **Commit changes**。

### 3. 改一行后台设置
1. 在 GitHub 仓库里依次点开 `admin` → `config.yml` → 右上角铅笔图标（Edit）。
2. 把 `repo: YOUR-GITHUB-NAME/cosmo-site` 里的 `YOUR-GITHUB-NAME` 换成你的 GitHub 用户名。
3. 点 **Commit changes**。

### 4. 用 Netlify 发布
1. 登录 Netlify → **Add new site**（或 Add new project）→ **Import an existing project** → **GitHub**。
2. 授权后选择 `cosmo-site`。
3. Build command **留空**，Publish directory 填 `/`（或留空）。
4. 点 **Deploy**。一两分钟后会得到一个临时网址，例如 `xxx.netlify.app`，打开就能看到网站。

### 5. 让后台能登录（GitHub 登录）
1. GitHub 右上角头像 → **Settings** → 左侧最下方 **Developer settings** → **OAuth Apps** → **New OAuth App**。
   - Application name：`Cosmo site admin`
   - Homepage URL：`https://cosmolee.work`（域名还没好就先填 `https://xxx.netlify.app`）
   - Authorization callback URL：`https://api.netlify.com/auth/done`
2. 创建后，复制 **Client ID**；再点 **Generate a new client secret**，复制 **Client secret**（只显示一次）。
3. 回到 Netlify 这个网站 → **Site configuration** → **Access & security** → **OAuth** → **Install provider** → 选 **GitHub** → 粘贴 Client ID 和 Client secret → 保存。
4. 打开 `xxx.netlify.app/admin`，点 **Login with GitHub**，能进到后台就成功了。

### 6. 买域名并绑定
1. 在 **Porkbun**（porkbun.com）购买 `cosmolee.work`（已完成）。
2. Netlify 网站页面 → **Domain management** → **Add a domain** → 输入 `cosmolee.work` → 按提示选择 **Netlify DNS**，它会给你 4 个 nameserver 地址。
3. 回到 Porkbun → Domain Management → `cosmolee.work` 右侧 **NS / Authoritative Nameservers** → 删除原来的，填入 Netlify 给的 4 个 → 保存。
4. 等几分钟到 24 小时生效。生效后 Netlify 会自动开启 HTTPS（地址栏小锁）。
5. 回到第 5 步的 GitHub OAuth App，把 Homepage URL 改成 `https://cosmolee.work`。

---

## 二、加图片、改文字（日常更新）

1. 浏览器打开 **cosmolee.work/admin** → **Login with GitHub**。
2. 左侧有两个栏目：
   - **作品项目**：所有项目、图片、阐述文字。
   - **网站设置**：名字、拼音、邮箱、小红书和 Instagram 链接、About 文字、首页中间的小图、Books & Zines 列表。

### 给某个项目加图片
1. 点 **作品项目** → **全部项目**。
2. 找到项目（例如 So Long and Thanks for All the Fish），点开。
3. 往下到 **图片**，点 **添加 图片**。
4. 点 **选择图片** → **上传** → 选电脑里的照片。
5. 填 **拍摄地点**、**日期**（如 2025.07.14）、**手写描述**（单张预览时显示在图片下方）。
6. 想调整顺序：拖动每张图片左侧的把手上下移动。网页上的编号 01、02…会按顺序自动生成。
7. 右上角点 **发布**（Publish）→ **立即发布**。约 1–2 分钟后刷新网站就能看到。

### 新建一个项目
在 **全部项目** 底部点 **添加 项目**，填：
- 项目名（首页手写体显示）
- 网址名：只用小写英文和连字符，例如 `sebou-river`
- 首页斜体注释、年份、首页悬停预览图
- 图片（同上）
- 阐述页：每一"页"是一项，段落之间空一行；最后一页自动显示"作品信息"和"脚注"

### 删除占位图
现在网站里的图片都是示意用的占位图。在每个项目的图片列表里，点占位图那一项右侧的 × 删除，换成你的作品即可。

---

## 三、上传前准备照片

| 项目 | 建议 |
|---|---|
| 格式 | JPEG，sRGB 色彩空间 |
| 尺寸 | 长边 2000–2500 像素 |
| 文件大小 | 每张 300–600 KB |
| 文件名 | 只用英文、数字、连字符，例如 `solong-01.jpg` |
| 首页小图 | 正方形，800×800 像素左右 |

---

## 四、文件说明（一般不用动）

| 文件 | 作用 |
|---|---|
| `index.html` / `project.html` / `statement.html` / `about.html` | 四种页面的框架 |
| `assets/style.css` | 颜色、字体、排版（酒红色在第 3 行 `--ink`） |
| `assets/site.js` | 把内容填进页面 |
| `content/projects.json`、`content/site.json` | 所有文字和图片列表（后台改的就是它们） |
| `images/` | 所有图片 |
| `admin/` | 后台 |
