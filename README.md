# Lumina - Modern Movie Discovery App

A beautifully designed Flutter application for discovering and exploring movies. Built with modern design principles and Flutter best practices.

## Features

### Core Functionality
- **Discover Movies**: Browse trending, popular, top-rated, and now playing movies
- **Search**: Find movies by title with real-time search
- **Favorites**: Save your favorite movies locally
- **Movie Details**: View comprehensive information about each movie
- **Modern UI**: Dark theme with gradient accents and smooth animations

### Technical Highlights
- Clean architecture with feature-based organization
- Provider for state management
- Cached network images for optimal performance
- Local storage with SharedPreferences
- Responsive grid and list layouts
- Custom theme system with Google Fonts
- RESTful API integration (TMDB)

## Project Structure

```
lib/
├── core/
│   ├── theme/           # App theme and colors
│   ├── constants/       # App-wide constants
│   └── utils/           # Utility functions
├── features/
│   ├── home/            # Home screen with movie discovery
│   ├── search/          # Search functionality
│   ├── favorites/       # Favorites management
│   ├── profile/         # User profile
│   └── movie_detail/    # Movie details screen
├── models/              # Data models
├── services/            # API and local services
├── widgets/             # Reusable widgets
└── main.dart            # App entry point
```

## Design System

### Color Palette
- **Primary Dark**: #1A1A2E
- **Primary Medium**: #16213E
- **Primary Light**: #0F3460
- **Accent**: #E94560
- **Background**: #0D0D1E

### Typography
- **Headings**: Poppins (Bold, Semi-bold)
- **Body**: Inter (Regular, Medium)

### Components
- Movie cards with gradient overlays
- Featured carousel with auto-scroll
- Grid and horizontal list layouts
- Custom search bar
- Floating action buttons
- Bottom navigation bar

## Setup Instructions

### Prerequisites
- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / Xcode (for mobile development)
- TMDB API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lumina.git
cd lumina
```

2. Install dependencies:
```bash
flutter pub get
```

3. Configure API Key:
   - Get your API key from [TMDB](https://www.themoviedb.org/settings/api)
   - Open `lib/services/movie_service.dart`
   - Replace `YOUR_TMDB_API_KEY` with your actual API key

4. Run the app:

**Web (开发环境):**
```bash
./run_dev.sh
# 或
flutter run -d chrome --web-browser-flag "--disable-web-security" --web-browser-flag "--user-data-dir=/tmp/chrome_dev_test"
```

**Android:**
```bash
flutter run -d android
```

**iOS:**
```bash
flutter run -d ios
```

**注意**: Web 版本需要禁用 CORS 检查才能访问视频 API。详见 [HTTP_SUPPORT.md](HTTP_SUPPORT.md)

## Dependencies

### Core
- `flutter`: SDK
- `provider`: ^6.1.1 - State management
- `go_router`: ^13.0.0 - Navigation

### UI
- `google_fonts`: ^6.1.0 - Typography
- `cached_network_image`: ^3.3.0 - Image caching
- `shimmer`: ^3.0.0 - Loading effects
- `flutter_svg`: ^2.0.9 - SVG support

### Network & Storage
- `http`: ^1.1.2 - HTTP client
- `dio`: ^5.4.0 - Advanced HTTP client
- `shared_preferences`: ^2.2.2 - Local storage

### Utilities
- `intl`: ^0.19.0 - Internationalization
- `equatable`: ^2.0.5 - Value equality

## Screens

### 1. Home Screen
- Featured movies carousel with auto-scroll
- Trending movies section
- Popular movies section
- Top-rated movies section
- Now playing movies section
- Pull-to-refresh functionality

### 2. Search Screen
- Real-time movie search
- Grid layout for results
- Empty state handling
- Clear search functionality

### 3. Favorites Screen
- Grid view of saved movies
- Local persistence
- Empty state with call-to-action
- Quick access to movie details

### 4. Profile Screen
- User statistics
- Settings and preferences
- App information
- Dark mode toggle (UI only)

### 5. Movie Detail Screen
- Full-screen backdrop image
- Movie information and ratings
- Genre tags
- Overview and description
- Add to favorites
- Action buttons (Play, Watchlist)

## Best Practices Implemented

### Architecture
- Feature-based folder structure
- Separation of concerns
- Service layer for API calls
- Model classes with Equatable

### Performance
- Image caching with CachedNetworkImage
- Lazy loading with ListView.builder
- Efficient state management
- Optimized rebuilds

### Code Quality
- Consistent naming conventions
- Proper widget composition
- Reusable components
- Type safety
- Error handling

### UI/UX
- Smooth animations and transitions
- Loading states
- Empty states
- Error states
- Responsive layouts
- Accessibility considerations

## API Integration

### Video API (Apple CMS V10 Format)

Lumina supports **Apple CMS V10 API format** for video content, similar to [LunaTV](https://github.com/MoonTechLab/LunaTV).

**Default Endpoint**: `https://tvs.zeabur.app/provide/vod`

**Features**:
- Multi-source video aggregation
- Search and filter by category, year, region
- Video details with play URLs
- Configurable API sources

See [API_CONFIG_EXAMPLE.md](API_CONFIG_EXAMPLE.md) for detailed configuration instructions.

### Movie Metadata API (Douban)

This app uses **Douban API** for movie and TV show metadata, similar to [LunaTV](https://github.com/MoonTechLab/LunaTV).

**Why Douban instead of TMDB?**
- ✅ No API key required
- ✅ Rich Chinese content
- ✅ Ratings aligned with Chinese audience preferences
- ✅ CDN acceleration support
- ✅ LunaTV compatible

**Features**:
- Search movies and TV shows by title
- Get hot/trending content
- Get recommendations with advanced filters
- Automatic best match for video titles
- Multiple proxy modes (Tencent CDN, Ali CDN, CORS proxies)

**Flutter Web Image Loading**:
- Flutter Web's `Image.network` cannot control HTTP headers (including Referer)
- Douban images require proper Referer header to load
- **Note**: Images may not load on Flutter Web due to browser security restrictions
- Works properly on mobile platforms (Android, iOS)
- Consider using a custom image proxy service for Web deployment

## Future Enhancements

- [ ] User authentication
- [ ] Movie reviews and ratings
- [ ] Watchlist functionality
- [ ] Movie trailers and videos
- [ ] Cast and crew information
- [ ] Similar movies recommendations
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Share functionality
- [ ] Advanced filters

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Movie data provided by [TMDB](https://www.themoviedb.org/)
- Icons from [Material Icons](https://fonts.google.com/icons)
- Fonts from [Google Fonts](https://fonts.google.com/)

## Contact

For questions or feedback, please open an issue on GitHub.

---

Built with Flutter and passion for great cinema.