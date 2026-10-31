# 更新日志

版本号跟着安装包走，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [1.0] — 2026-10-31

第一个公开版本。装得上、启动得了、出事查得到。

### 功能

- 实例管理：名称、版本、加载器、内存、窗口尺寸、JVM 参数各自独立
- 版本安装：官方与国内镜像双源竞速，Alpha 至今的正式版都能装
- 模组加载器：原版 / Fabric / Forge / NeoForge / Quilt，装完可换
- Java 自动匹配：按版本 JSON 的 `javaVersion` 找，找不到时降级并明确告知
- 启动前自检：Java、依赖库、资源索引缺什么、缺多少，写在卡片里
- 日志：stdout、stderr、退出码、完整命令行，可复制
- 离线账户
- 原生界面，跟随系统深色模式与字号

### 修掉的问题

这些是开发过程中真实踩到、并留在测试里的：

- 63 个依赖库全部指向空的实例私有目录（原因：按 artifact 的 url 重算路径，和安装器分叉了）
- 明明装了 Java 22 却报「缺少 Java 21」（原因：界面早于 Java 扫描取值）
- `-Djava.library.path=${natives_directory}` 以字面量覆盖正确值（原因：jvm 参数没过占位符替换）
- `java: -cp requires class path specification`（原因：`${classpath}` 替换成空串，还补了第二个 `-cp`）
- 关掉游戏后按钮仍显示「停止游戏」，切页签才恢复（原因：嵌套的 ObservableObject 没把状态转发给 `AppState`）
- 点「停止」偶发卡住（原因：只发 SIGINT，进程不响应就一直等；改成 SIGINT → 1.5 秒 → SIGTERM）

### 已知问题

- 没有 Apple 公证，首次打开要右键「打开」或 `xattr -dr com.apple.quarantine`
- 只有离线账户，微软登录的界面还没做
- 整合包导入／导出没有界面入口
- 快照版本能装但没系统测过

[1.0]: https://github.com/apple-PC/macl/releases/tag/v1.0
