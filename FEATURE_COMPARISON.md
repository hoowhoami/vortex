# Feature Comparison: Vortex vs LunaTV

## Overview
This document compares the current Vortex implementation with the reference LunaTV project to identify missing features and guide implementation.

---

## 1. API Endpoints Comparison

### ✅ Implemented in Vortex
- `GET /api/search` - SSE streaming search
- `GET /api/detail` - Video detail fetching

### ❌ Missing in Vortex (40 total in LunaTV)

#### Authentication & User Management
- `POST /api/login` - User authentication with cookie signing
- `POST /api/logout` - Logout endpoint
- `POST /api/change-password` - Change user password
- `GET /api/server-config` - Public server configuration

#### Search Enhancements
- `GET /api/search/suggestions` - Search suggestions
- `GET /api/search/one` - Single source search
- `GET /api/search/resources` - Available search resources
- `GET /api/search/ws` - WebSocket search endpoint
- `GET /api/searchhistory` - Get search history (with POST/DELETE)

#### User Data Management (Critical)
- `GET/POST/DELETE /api/favorites` - Manage favorites (currently client-only)
- `GET/POST/DELETE /api/playrecords` - Manage play history (currently client-only)
- `GET/POST/DELETE /api/skipconfigs` - Skip intro/outro configurations

#### Douban Integration
- `GET /api/douban` - Douban data (main endpoint)
- `GET /api/douban/categories` - Douban categories
- `GET /api/douban/recommends` - Douban recommendations

#### Live TV
- `GET /api/live/sources` - Get live sources
- `GET /api/live/channels` - Get live channels
- `GET /api/live/epg` - EPG program guide
- `GET /api/live/precheck` - Pre-check live availability

#### Media Proxy (Essential for Cross-Origin)
- `GET /api/proxy/m3u8` - M3U8 proxy
- `GET /api/proxy/segment` - Segment proxy
- `GET /api/proxy/key` - Encryption key proxy
- `GET /api/proxy/logo` - Channel logo proxy
- `GET /api/image-proxy` - Image proxy for external images

#### Admin Management (Critical)
- `GET/POST /api/admin/config` - Manage admin configuration
- `POST /api/admin/user` - User management (add/ban/setAdmin)
- `POST /api/admin/source` - Source management
- `POST /api/admin/source/validate` - Validate source URLs
- `POST /api/admin/category` - Manage categories
- `POST /api/admin/site` - Site configuration
- `POST /api/admin/live` - Live source management
- `POST /api/admin/live/refresh` - Refresh live sources
- `POST /api/admin/config_file` - Manage config file (JSON editor)
- `POST /api/admin/config_subscription` - Config subscription management
- `POST /api/admin/config_subscription/fetch` - Fetch config subscriptions
- `POST /api/admin/data_migration/export` - Export data with encryption
- `POST /api/admin/data_migration/import` - Import data with decryption
- `POST /api/admin/reset` - Reset configuration

#### Background Tasks
- `GET /api/cron` - Cron job endpoints

---

## 2. Authentication & Security

### Current Vortex Implementation
- ✅ Simple localStorage-based auth
- ✅ Basic role support (owner/admin/user)
- ❌ No cookie-based sessions
- ❌ No HMAC-SHA256 signing
- ❌ No replay attack prevention
- ❌ No middleware authentication

### LunaTV Implementation
- ✅ Cookie-based authentication with HMAC-SHA256
- ✅ Replay attack prevention with timestamps
- ✅ Middleware authentication for all routes
- ✅ Support for both localStorage and database modes
- ✅ Per-user API filtering
- ✅ User banning capability
- ✅ Tag-based API restrictions

### Required Implementation
1. Add `middleware.ts` for authentication
2. Implement cookie signing with HMAC-SHA256
3. Add timestamp-based replay protection
4. Implement proper login/logout API endpoints
5. Add user session management

---

## 3. Data Storage & Sync

### Current Vortex Implementation
- ✅ StorageService abstraction layer
- ✅ LocalStorage support
- ⚠️ Configuration ready for Redis/Upstash/Kvrocks (not implemented)
- ❌ No server-side API endpoints for data sync

### LunaTV Implementation
- ✅ Multi-backend support (LocalStorage, Redis, Kvrocks, Upstash)
- ✅ Server-side API endpoints for all data operations
- ✅ Database client with event system
- ✅ Real-time data sync across devices

### Required Implementation
1. Implement server-side storage layer
2. Add Redis/Upstash/Kvrocks database adapters
3. Create API endpoints for favorites, playrecords, searchhistory
4. Add data synchronization logic
5. Implement client-server sync events

---

## 4. Admin Panel Features

### Current Vortex Implementation
- ✅ Site configuration (name, announcement)
- ✅ Video sources management (add/edit/delete)
- ✅ User display (read-only)
- ✅ About section
- ❌ No config file editor
- ❌ No data migration
- ❌ No user management (add/ban/promote)
- ❌ No live source management
- ❌ No category management
- ❌ No source validation
- ❌ No drag-and-drop reordering
- ❌ No config subscriptions

### LunaTV Implementation
- ✅ Complete user management (add/ban/setAdmin/changePassword)
- ✅ Live source management with EPG
- ✅ Category management (custom categories)
- ✅ Config file JSON editor
- ✅ Data migration with AES encryption
- ✅ Config subscriptions (base58 encoded)
- ✅ Source validation and testing
- ✅ Drag-and-drop source reordering
- ✅ Batch operations

### Required Implementation
1. Add user management API and UI
2. Implement live source management
3. Add category management
4. Create config file editor with JSON validation
5. Implement data migration with encryption
6. Add config subscription system
7. Implement source validation
8. Add drag-and-drop reordering (@dnd-kit already installed)

---

## 5. Video Player Features

### Current Vortex Implementation
- ✅ ArtPlayer with HLS.js
- ✅ Episode selection
- ✅ Progress tracking (debounced)
- ✅ Multiple sources support
- ✅ Wake Lock API
- ❌ No skip intro/outro feature
- ❌ No ad-blocking (experimental)
- ❌ No skip configuration UI

### LunaTV Implementation
- ✅ All Vortex features
- ✅ Skip intro/outro configuration per video
- ✅ Automatic ad detection and skipping (experimental)
- ✅ Skip configuration API

### Required Implementation
1. Add skip intro/outro configuration UI
2. Implement skip timing logic in player
3. Create skipconfigs API endpoints
4. Add per-video skip settings storage
5. (Optional) Implement ad detection and skipping

---

## 6. Douban Integration

### Current Vortex Implementation
- ✅ Basic Douban page with tabs
- ✅ Mock data generation
- ❌ Using mock data only (no real API calls)
- ❌ No categories system
- ❌ No custom categories
- ❌ No recommendations
- ❌ No proxy configuration working

### LunaTV Implementation
- ✅ Full Douban API integration
- ✅ Multiple proxy options (direct, CORS proxy, CDN)
- ✅ Custom categories with filters
- ✅ Recommendations API
- ✅ Configurable proxy settings
- ✅ Image proxy support

### Required Implementation
1. Implement real Douban API client
2. Add proxy configuration and switching
3. Create categories API endpoint
4. Add custom categories support
5. Implement recommendations endpoint
6. Add image proxy for Douban images

---

## 7. Live TV Features

### Current Vortex Implementation
- ✅ Live page with channel groups
- ✅ M3U parser (basic)
- ✅ Mock live data
- ❌ No EPG (Electronic Program Guide)
- ❌ No live sources API
- ❌ No channel favorites
- ❌ No real M3U URL fetching

### LunaTV Implementation
- ✅ Multiple live source support
- ✅ EPG program guide display
- ✅ Channel favorites
- ✅ Live sources API
- ✅ EPG API with time scheduling
- ✅ Channel logo proxy
- ✅ Pre-check availability

### Required Implementation
1. Implement live sources API endpoints
2. Add EPG fetching and parsing
3. Create EPG display UI
4. Add channel favorites functionality
5. Implement logo proxy
6. Add live stream pre-check

---

## 8. Search Features

### Current Vortex Implementation
- ✅ Multi-source search with SSE
- ✅ Basic search history (client-side)
- ✅ Aggregation by title
- ⚠️ Type and year filtering (UI exists, not fully utilized)
- ❌ No search suggestions API
- ❌ No WebSocket search
- ❌ No search history API
- ❌ No search resources endpoint

### LunaTV Implementation
- ✅ All Vortex features
- ✅ Search suggestions API
- ✅ WebSocket search for real-time updates
- ✅ Search history API with sync
- ✅ Search resources endpoint (available sources)
- ✅ Single source search option
- ✅ Advanced filtering and sorting

### Required Implementation
1. Add search suggestions API endpoint
2. Implement WebSocket search endpoint
3. Create search history API (GET/POST/DELETE)
4. Add search resources endpoint
5. Implement single source search API
6. Enhance filtering logic (type, year, source)

---

## 9. Additional Features

### Missing in Vortex

#### Bangumi Integration
- Anime broadcast calendar
- Weekly schedule display
- Bangumi API integration
- Anime-specific features

#### Announcement System
- Modal announcement display on home page
- Admin-configurable announcements
- Dismissible announcements

#### Version Management
- Version display
- Update checking
- Version comparison logic
- Update notifications

#### Content Filtering
- Yellow/adult content filtering
- Configurable filter toggle
- Word-based filtering

#### Media Proxies
- M3U8 proxy for cross-origin streams
- Segment proxy for encrypted content
- Key proxy for DRM content
- Image proxy for external images
- Logo proxy for channels

#### Configuration Subscriptions
- Base58-encoded config distribution
- Auto-update from remote URLs
- Config fetch and merge
- Subscription management

#### Data Migration
- Export all data with AES encryption
- Import with decryption
- Password-protected backups
- Complete database reset

---

## 10. Component Differences

### Missing Components in Vortex
1. **DataMigration** - Export/import with encryption
2. **VersionPanel** - Version info and update checker
3. **EpgScrollableRow** - EPG program guide display
4. **SearchSuggestions** - Search keyword suggestions component
5. **CapsuleSwitch** - Tab switching control
6. **MultiLevelSelector** - Multi-level dropdown selector
7. **WeekdaySelector** - Weekday selection for anime
8. **DoubanSelector** - Douban category selector component
9. **DoubanCustomSelector** - Custom category selector
10. **ContinueWatching** - Enhanced continue watching component
11. **SearchResultFilter** - Advanced filter component

---

## 11. Library & Utility Differences

### Missing Libraries in Vortex
1. **Bangumi Client** (`lib/bangumi.client.ts`) - Anime calendar data
2. **Crypto Utils** (`lib/crypto.ts`) - AES encryption/decryption
3. **Time Utils** (`lib/time.ts`) - Time parsing utilities
4. **Version Utils** (`lib/version.ts`) - Version management
5. **Yellow Filter** (`lib/yellow.ts`) - Content filtering
6. **Auth Middleware** (`middleware.ts`) - Route protection
7. **Enhanced Config** - More comprehensive config system
8. **Database Manager** - Server-side database abstraction

---

## 12. Environment Variable Differences

### Missing in Vortex
- `USERNAME` - Admin username (using ADMIN_USERNAME)
- `PASSWORD` - Admin password (using ADMIN_PASSWORD)
- `SITE_BASE` - Site base URL
- Specific storage URLs for each backend
- More granular configuration options

---

## Implementation Priority

### 🔴 Critical (Core Functionality)
1. Server-side data storage APIs (favorites, playrecords, searchhistory)
2. Authentication middleware and cookie signing
3. Admin user management functionality
4. Real Douban API integration
5. Media proxy endpoints (M3U8, segment, image)

### 🟡 High Priority (Enhanced Features)
1. Live TV EPG and API endpoints
2. Skip intro/outro configuration
3. Data migration with encryption
4. Config file editor
5. Search suggestions and WebSocket support

### 🟢 Medium Priority (Nice to Have)
1. Bangumi anime calendar
2. Version management and update checker
3. Config subscriptions
4. Advanced admin features (validation, reordering)
5. Content filtering

### 🔵 Low Priority (Optional)
1. Ad-blocking (experimental)
2. Cron jobs
3. Additional proxy options
4. Enhanced UI components

---

## Next Steps

1. Review this comparison document
2. Prioritize features based on your needs
3. Start with Critical priority items
4. Implement features incrementally
5. Test each feature thoroughly before moving to the next

Would you like me to start implementing any specific feature category?
