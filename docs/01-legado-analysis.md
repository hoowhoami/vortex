# Legado 项目深度分析报告

> 分析时间: 2026-01-07
> 分析对象: Legado (阅读 3.0) - 开源 Android 小说阅读器
> 项目地址: /Users/whoami/opt/workspace/owner/legado

## 一、项目概览

### 1.1 项目定位

Legado (阅读 3.0) 是一款免费开源的 Android 小说阅读应用，最大特色是**自定义书源系统**，允许用户通过规则抓取任意网站的小说内容。

### 1.2 核心特性

- 自定义书源规则，支持网页内容抓取
- 支持多种本地格式 (TXT, EPUB, PDF, MOBI, AZW3)
- RSS 订阅功能
- 高度自定义的阅读界面
- WebDAV 云同步
- TTS 朗读功能
- Web 界面 (Vue.js 实现)
- 内容替换和净化规则
- 完全开源，无广告

---

## 二、技术架构分析

### 2.1 整体架构

```
legado/
├── app/                    # 主应用模块 (Android)
│   ├── src/main/
│   │   ├── java/io/legado/app/
│   │   │   ├── base/      # 基础类
│   │   │   ├── data/      # 数据层
│   │   │   ├── help/      # 辅助工具
│   │   │   ├── lib/       # 第三方库
│   │   │   ├── model/     # 业务模型
│   │   │   ├── service/   # 服务层
│   │   │   └── ui/        # UI 层
│   │   └── res/           # 资源文件
│   └── build.gradle
│
├── modules/
│   ├── book/              # 书籍处理模块
│   ├── rhino/             # JavaScript 引擎模块
│   └── web/               # Web 界面模块 (Vue.js)
│
└── gradle/                # 构建配置
```

### 2.2 技术栈

#### Android 端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Kotlin** | - | 主要开发语言 |
| **Android SDK** | Target 36, Compile 36 | 平台支持 |
| **Room** | 2.7.1 | 本地数据库 ORM |
| **OkHttp** | 5.3.2 | HTTP 网络请求 |
| **Cronet** | - | Chromium 网络引擎 (性能优化) |
| **Rhino** | 1.8.1 | JavaScript 引擎 |
| **Glide** | 5.0.5 | 图片加载和缓存 |
| **Jsoup** | 1.16.2 | HTML 解析 |
| **Gson** | 2.13.2 | JSON 序列化 |
| **Coroutines** | 1.10.2 | 异步编程 |
| **NanoHttpd** | 2.3.1 | 内置 HTTP 服务器 |

#### Web 模块

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue.js** | 3.5.12 | 前端框架 |
| **TypeScript** | - | 类型安全 |
| **Vite** | 5.4.8 | 构建工具 |
| **Element Plus** | 2.8.5 | UI 组件库 |
| **Pinia** | 2.2.4 | 状态管理 |
| **Vue Router** | 4.4.5 | 路由管理 |

### 2.3 架构模式

**MVVM (Model-View-ViewModel)**

```
UI Layer (Activity/Fragment)
    ↓ observes
ViewModel (LiveData/StateFlow)
    ↓ uses
Repository (数据仓库)
    ↓ accesses
Data Source (Room DAO / Network API)
```

---

## 三、核心功能实现分析

### 3.1 书源系统

#### 规则引擎架构

```
用户定义书源规则 (JSON)
    ↓
HTTP 请求 (OkHttp/Cronet)
    ↓
HTML/XML 解析 (Jsoup/XPath)
    ↓
规则匹配引擎
    ├─ XPath 选择器
    ├─ CSS 选择器
    ├─ 正则表达式
    └─ JavaScript 执行 (Rhino)
    ↓
内容提取与处理
    ↓
数据存储 (Room Database)
```

#### 书源规则示例

```json
{
  "bookSourceUrl": "https://example.com",
  "bookSourceName": "示例书源",
  "bookSourceType": 0,
  "searchUrl": "https://example.com/search?q={{key}}",
  "ruleSearch": {
    "bookList": "//div[@class='book-item']",
    "name": "h3.title@text",
    "author": "span.author@text",
    "bookUrl": "a@href"
  },
  "ruleBookInfo": {
    "name": "h1.book-name@text",
    "author": "div.author-name@text",
    "intro": "div.intro@text",
    "coverUrl": "img.cover@src",
    "tocUrl": "a.catalog@href"
  },
  "ruleToc": {
    "chapterList": "ul.chapter-list > li",
    "chapterName": "a@text",
    "chapterUrl": "a@href"
  },
  "ruleContent": {
    "content": "div.content@html"
  }
}
```

#### JavaScript 规则执行

```kotlin
// 示例：使用 Rhino 执行 JavaScript
val rhino = RhinoScriptEngine()
val result = rhino.eval("""
    function processContent(html) {
        // 自定义处理逻辑
        return html.replace(/<script>.*?<\/script>/g, '');
    }
    processContent('$html');
""")
```

### 3.2 阅读引擎

#### 文本布局系统

```kotlin
// 文本布局核心逻辑
class TextLayoutEngine {
    // 1. 文本分段
    fun splitParagraphs(content: String): List<String>

    // 2. 行布局计算
    fun layoutLines(
        text: String,
        width: Int,
        fontSize: Float,
        lineSpacing: Float
    ): List<TextLine>

    // 3. 页面分割
    fun splitPages(
        lines: List<TextLine>,
        pageHeight: Int
    ): List<Page>

    // 4. 缓存管理
    fun cachePages(bookId: String, chapterIndex: Int, pages: List<Page>)
}
```

#### 翻页模式实现

```kotlin
sealed class PageMode {
    object Cover     // 覆盖翻页
    object Simulation // 仿真翻页 (3D 翻转效果)
    object Slide     // 滑动翻页
    object Scroll    // 滚动模式
    object None      // 无动画
}

class PageAnimationController {
    fun animate(
        mode: PageMode,
        fromPage: Page,
        toPage: Page,
        progress: Float
    ): Canvas
}
```

### 3.3 数据库设计

#### 核心实体

```kotlin
// 书籍实体
@Entity(tableName = "books")
data class Book(
    @PrimaryKey
    val bookUrl: String,
    val name: String,
    val author: String,
    val intro: String?,
    val coverUrl: String?,
    val tocUrl: String,
    val origin: String,          // 书源 URL
    val originName: String,      // 书源名称
    val lastCheckTime: Long,     // 最后检查更新时间
    val latestChapterTitle: String?,
    val durChapterIndex: Int,    // 当前章节索引
    val durChapterPos: Int,      // 当前阅读位置
    val durChapterTime: Long,    // 阅读时间
    val group: Int,              // 分组
    val wordCount: String?       // 字数
)

// 章节实体
@Entity(tableName = "chapters", indices = [Index("bookUrl")])
data class BookChapter(
    @PrimaryKey
    val url: String,
    val bookUrl: String,         // 外键
    val index: Int,              // 章节序号
    val title: String,           // 章节标题
    val tag: String?,            // 标签
    val isVip: Boolean,          // 是否 VIP
    val isPay: Boolean,          // 是否付费
    val resourceUrl: String?     // 资源 URL
)

// 书源实体
@Entity(tableName = "book_sources")
data class BookSource(
    @PrimaryKey
    val bookSourceUrl: String,
    val bookSourceName: String,
    val bookSourceType: Int,     // 0: 网络, 1: 本地
    val bookSourceGroup: String?,
    val enabled: Boolean,
    val enabledExplore: Boolean,
    val weight: Int,             // 权重
    val searchUrl: String?,
    val exploreUrl: String?,
    val ruleSearch: SearchRule?,
    val ruleBookInfo: BookInfoRule?,
    val ruleToc: TocRule?,
    val ruleContent: ContentRule?
)
```

#### DAO 层

```kotlin
@Dao
interface BookDao {
    @Query("SELECT * FROM books ORDER BY durChapterTime DESC")
    fun observeAll(): Flow<List<Book>>

    @Query("SELECT * FROM books WHERE bookUrl = :bookUrl")
    suspend fun getBook(bookUrl: String): Book?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(book: Book)

    @Update
    suspend fun update(book: Book)

    @Delete
    suspend fun delete(book: Book)
}
```

### 3.4 网络层

#### HTTP 请求封装

```kotlin
class NetworkManager {
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .connectionPool(ConnectionPool(32, 5, TimeUnit.MINUTES))
        .build()

    suspend fun fetch(
        url: String,
        headers: Map<String, String> = emptyMap()
    ): Response = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(url)
            .apply {
                headers.forEach { (key, value) ->
                    addHeader(key, value)
                }
            }
            .build()

        okHttpClient.newCall(request).execute()
    }
}
```

#### 并发控制

```kotlin
class DownloadManager {
    // 限制每个书源的并发请求数
    private val semaphores = ConcurrentHashMap<String, Semaphore>()

    suspend fun downloadChapter(
        source: BookSource,
        chapter: BookChapter
    ): String {
        val semaphore = semaphores.getOrPut(source.bookSourceUrl) {
            Semaphore(source.concurrentRate ?: 1)
        }

        semaphore.acquire()
        try {
            return fetchContent(chapter.url)
        } finally {
            semaphore.release()
        }
    }
}
```

### 3.5 服务层

#### 前台服务

```kotlin
// 下载服务
class DownloadService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 创建前台通知
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        // 启动下载任务
        scope.launch {
            downloadQueue.collect { book ->
                downloadBook(book)
            }
        }

        return START_STICKY
    }
}

// TTS 服务
class TTSService : Service() {
    private lateinit var textToSpeech: TextToSpeech

    fun speak(text: String) {
        textToSpeech.speak(text, TextToSpeech.QUEUE_ADD, null, null)
    }
}

// Web 服务
class WebService : Service() {
    private var httpServer: NanoHTTPD? = null

    override fun onCreate() {
        super.onCreate()
        httpServer = BookServer(8080).apply {
            start()
        }
    }
}
```

---

## 四、UI/UX 分析

### 4.1 导航结构

```
MainActivity (底部导航)
├─ BookshelfFragment (书架)
├─ ExploreFragment (发现)
├─ RssFragment (订阅)
└─ MyFragment (我的)

ReadActivity (阅读界面)
├─ ReadMenu (菜单)
├─ PageView (页面)
└─ SettingDialog (设置)
```

### 4.2 UI 特点

**优点:**
- 功能完整，配置项丰富
- 支持高度自定义
- Material Design 设计

**不足:**
- 视觉设计较为传统
- 部分界面较为拥挤
- 动画效果较少
- UI 层级较深

### 4.3 主题系统

```xml
<!-- Material Design 2 -->
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
    <item name="colorPrimary">@color/primary</item>
    <item name="colorAccent">@color/accent</item>
</style>
```

---

## 五、性能优化

### 5.1 优化策略

1. **网络优化**
   - 使用 Cronet (Chromium 网络栈)
   - 连接池复用
   - HTTP/2 支持

2. **内存优化**
   - 章节内容分页缓存
   - 图片缓存 (Glide LRU)
   - 及时释放资源

3. **启动优化**
   - 延迟初始化
   - 异步加载
   - 减少主线程操作

4. **数据库优化**
   - 索引优化
   - 批量操作
   - 事务管理

### 5.2 缓存策略

```kotlin
class CacheManager {
    // 章节内容缓存 (LRU)
    private val contentCache = LruCache<String, String>(100)

    // 图片缓存 (Glide 管理)
    private val imageCache = GlideCache()

    // 书源规则缓存
    private val ruleCache = ConcurrentHashMap<String, BookSource>()
}
```

---

## 六、核心优势与创新

### 6.1 核心优势

1. **极高的灵活性**
   - 用户可自定义任意网站的抓取规则
   - 不依赖特定内容源

2. **强大的规则引擎**
   - 支持 XPath, CSS Selector, RegEx, JSONPath
   - JavaScript 动态执行
   - 内容替换和净化

3. **完整的功能**
   - 本地导入
   - 在线阅读
   - RSS 订阅
   - TTS 朗读
   - WebDAV 同步

4. **开源生态**
   - 完全开源
   - 社区活跃
   - 规则共享

### 6.2 技术亮点

1. **模块化架构**
   - 清晰的模块划分
   - 独立的 book, rhino, web 模块

2. **高性能网络**
   - Cronet 优化
   - 并发控制
   - 智能缓存

3. **双界面支持**
   - Android 原生
   - Web 界面 (Vue.js)

---

## 七、存在的问题与改进空间

### 7.1 技术债务

1. **平台限制**
   - 仅支持 Android
   - 无 iOS 版本

2. **代码维护**
   - 部分 Java 遗留代码
   - 架构演进导致的复杂性

3. **UI 老化**
   - Material Design 2 (非最新)
   - 缺少现代化动画

### 7.2 用户体验

1. **学习曲线**
   - 书源规则较复杂
   - 新手上手门槛高

2. **UI 设计**
   - 界面较为朴素
   - 视觉层级不够清晰

3. **性能问题**
   - 大量 JavaScript 执行可能影响性能
   - 内存占用较高

---

## 八、对 Vortex 的启示

### 8.1 应该继承的优点

1. ✅ **书源规则系统** - 核心竞争力
2. ✅ **JavaScript 引擎** - 处理复杂网站
3. ✅ **内容替换规则** - 净化广告
4. ✅ **WebDAV 同步** - 跨设备同步
5. ✅ **高度可定制** - 阅读设置
6. ✅ **本地格式支持** - EPUB, TXT 等

### 8.2 应该改进的方向

1. 🔄 **跨平台支持** - Flutter 实现 iOS + Android
2. 🔄 **现代化 UI** - Material Design 3, 护眼设计
3. 🔄 **性能优化** - 更高效的 JS 引擎 (QuickJS)
4. 🔄 **简化操作** - 降低学习曲线
5. 🔄 **动画体验** - 流畅的微动效
6. 🔄 **更好的架构** - Clean Architecture

### 8.3 可以舍弃的功能

1. ❌ **Web 界面** - 专注移动端
2. ❌ **RSS 订阅** - 可后续添加 (非核心)
3. ❌ **部分复杂功能** - 先实现 MVP

---

## 九、技术选型对比

### 9.1 Legado vs Vortex

| 维度 | Legado | Vortex (目标) |
|------|--------|---------------|
| **平台** | Android 原生 | Flutter (iOS + Android) |
| **语言** | Kotlin/Java | Dart |
| **UI 框架** | XML + Material 2 | Flutter + Material 3 |
| **数据库** | Room (SQLite) | Isar/Drift |
| **网络** | OkHttp + Cronet | Dio + Cronet HTTP |
| **JS 引擎** | Rhino | QuickJS (FFI) |
| **架构** | MVVM | Clean Architecture + MVVM |
| **状态管理** | LiveData/Flow | Riverpod |
| **UI 风格** | 传统 MD2 | 现代简约风 + MD3 |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (目标) |
| **开发效率** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **跨平台** | ❌ | ✅ |

### 9.2 核心技术决策

| 功能模块 | Legado 方案 | Vortex 方案 | 选择理由 |
|---------|-------------|-------------|----------|
| **书源解析** | Jsoup + Rhino | Jsoup + QuickJS | QuickJS 性能更好 |
| **文本渲染** | Canvas 绘制 | Flutter CustomPaint | 跨平台一致性 |
| **数据存储** | Room | Isar | 更快的查询性能 |
| **状态管理** | LiveData | Riverpod | 更强大的依赖注入 |
| **网络请求** | OkHttp | Dio | Dart 生态首选 |

---

## 十、总结

### 10.1 Legado 的成功要素

1. **强大的规则引擎** - 解决了内容源多样性问题
2. **完全开源** - 建立了活跃的社区
3. **功能完整** - 满足了重度用户的需求
4. **持续维护** - 保持更新和优化

### 10.2 Vortex 的机会

1. **跨平台优势** - 覆盖 iOS 用户
2. **现代化体验** - 吸引年轻用户
3. **更好的性能** - QuickJS + Flutter
4. **简化使用** - 降低门槛

### 10.3 核心挑战

1. **规则兼容性** - 需要支持 Legado 书源格式
2. **性能要求高** - 阅读类 App 对流畅度要求高
3. **生态建设** - 需要时间积累用户和规则
4. **差异化竞争** - 在功能基础上突出体验

---

## 附录

### A. 参考资源

- Legado GitHub: https://github.com/gedoor/legado
- Legado 官方文档: https://www.yuque.com/legado/wiki
- 书源规则教程: https://mgz0227.github.io/The-tutorial-of-Legado/

### B. 关键文件

- `/app/src/main/java/io/legado/app/data/AppDatabase.kt` - 数据库定义
- `/app/src/main/java/io/legado/app/model/analyzeRule/` - 规则引擎
- `/app/src/main/java/io/legado/app/ui/book/read/` - 阅读界面
- `/app/src/main/java/io/legado/app/model/webBook/` - 网络书籍处理

### C. 术语表

- **书源**: 定义如何从特定网站抓取小说内容的规则配置
- **规则引擎**: 解析和执行书源规则的核心组件
- **内容替换**: 用于过滤广告和优化内容的规则系统
- **WebDAV**: 基于 HTTP 的文件共享协议，用于数据同步
- **TTS**: Text-to-Speech，文本转语音功能

---

**文档版本**: 1.0
**最后更新**: 2026-01-07
