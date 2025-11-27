import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/app_localizations.dart';
import '../../services/app_settings_service.dart' as settings;
import '../../services/api_source_service.dart';
import '../../services/config_subscription_service.dart';
import '../../services/site_config_service.dart';
import '../../models/douban.dart';
import 'api_source_management_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isAppearanceExpanded = false;
  bool _isLanguageExpanded = false;
  bool _isConfigFileExpanded = false;
  bool _isSiteConfigExpanded = true;
  bool _isVideoSourceExpanded = false;
  bool _isAboutExpanded = false;

  final _subscriptionUrlController = TextEditingController();
  final _siteNameController = TextEditingController();
  final _cacheTimeController = TextEditingController();
  final _configJsonController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize controllers with service values
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final configService = context.read<ConfigSubscriptionService>();
      final siteService = context.read<SiteConfigService>();

      _subscriptionUrlController.text = configService.subscriptionUrl;
      _siteNameController.text = siteService.siteName;
      _cacheTimeController.text = siteService.cacheTime.toString();
    });
  }

  @override
  void dispose() {
    _subscriptionUrlController.dispose();
    _siteNameController.dispose();
    _cacheTimeController.dispose();
    _configJsonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final settingsService = context.watch<settings.AppSettingsService>();

    return Scaffold(
      appBar: AppBar(
        title: Text(loc.settings),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppConstants.spacingMd),
        children: [
          _buildCollapsibleSection(
            context,
            icon: Icons.palette_outlined,
            title: loc.appearance,
            isExpanded: _isAppearanceExpanded,
            onToggle: () {
              setState(() {
                _isAppearanceExpanded = !_isAppearanceExpanded;
              });
            },
            child: _buildAppearanceContent(context, settingsService),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          _buildCollapsibleSection(
            context,
            icon: Icons.language_rounded,
            title: loc.language,
            isExpanded: _isLanguageExpanded,
            onToggle: () {
              setState(() {
                _isLanguageExpanded = !_isLanguageExpanded;
              });
            },
            child: _buildLanguageContent(context, settingsService),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          _buildCollapsibleSection(
            context,
            icon: Icons.description,
            title: '配置文件',
            isExpanded: _isConfigFileExpanded,
            onToggle: () {
              setState(() {
                _isConfigFileExpanded = !_isConfigFileExpanded;
              });
            },
            child: _buildConfigFileContent(context),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          _buildCollapsibleSection(
            context,
            icon: Icons.settings,
            title: '站点配置',
            isExpanded: _isSiteConfigExpanded,
            onToggle: () {
              setState(() {
                _isSiteConfigExpanded = !_isSiteConfigExpanded;
              });
            },
            child: _buildSiteConfigContent(context, settingsService),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          _buildCollapsibleSection(
            context,
            icon: Icons.video_library,
            title: '视频源配置',
            isExpanded: _isVideoSourceExpanded,
            onToggle: () {
              setState(() {
                _isVideoSourceExpanded = !_isVideoSourceExpanded;
              });
            },
            child: _buildVideoSourceContent(context),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          _buildCollapsibleSection(
            context,
            icon: Icons.info_outline,
            title: loc.about,
            isExpanded: _isAboutExpanded,
            onToggle: () {
              setState(() {
                _isAboutExpanded = !_isAboutExpanded;
              });
            },
            child: _buildAboutOptions(context),
          ),
        ],
      ),
    );
  }

  Widget _buildCollapsibleSection(
    BuildContext context, {
    required IconData icon,
    required String title,
    required bool isExpanded,
    required VoidCallback onToggle,
    required Widget child,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppConstants.radiusLg),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05),
        ),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: onToggle,
            borderRadius: BorderRadius.vertical(
              top: const Radius.circular(AppConstants.radiusLg),
              bottom: isExpanded ? Radius.zero : const Radius.circular(AppConstants.radiusLg),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppConstants.spacingMd),
              child: Row(
                children: [
                  Icon(icon, color: AppColors.accent),
                  const SizedBox(width: AppConstants.spacingMd),
                  Expanded(
                    child: Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  AnimatedRotation(
                    turns: isExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(Icons.keyboard_arrow_down),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: child,
            crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
        ],
      ),
    );
  }

  Widget _buildConfigFileContent(BuildContext context) {
    final configService = context.watch<ConfigSubscriptionService>();
    final apiSourceService = context.read<ApiSourceService>();

    String getLastUpdateText() {
      if (configService.lastUpdate == null) {
        return '最后更新: 从未更新';
      }
      final formatter = DateFormat('yyyy/MM/dd HH:mm:ss');
      return '最后更新: ${formatter.format(configService.lastUpdate!)}';
    }

    return Padding(
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '配置订阅',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            getLastUpdateText(),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          Text(
            '订阅URL',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppConstants.spacingSm),
          TextField(
            controller: _subscriptionUrlController,
            decoration: const InputDecoration(
              hintText: 'https://gist.githubusercontent.com/...',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.all(AppConstants.spacingMd),
              helperText: '输入配置文件的订阅地址，要求 JSON 格式',
              helperMaxLines: 2,
            ),
            onChanged: configService.setSubscriptionUrl,
          ),
          const SizedBox(height: AppConstants.spacingMd),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                if (_subscriptionUrlController.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('请输入订阅URL'),
                      backgroundColor: Colors.orange,
                    ),
                  );
                  return;
                }

                // Show loading dialog
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (context) => const Center(
                    child: CircularProgressIndicator(),
                  ),
                );

                try {
                  final config = await configService.pullConfiguration();

                  // Display the pulled configuration in the text field
                  final prettyJson = const JsonEncoder.withIndent('  ').convert(config);
                  _configJsonController.text = prettyJson;

                  if (context.mounted) {
                    Navigator.pop(context); // Close loading dialog
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('配置拉取成功！请检查配置内容后点击"保存配置"按钮应用'),
                        backgroundColor: Colors.green,
                        duration: Duration(seconds: 3),
                      ),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    Navigator.pop(context); // Close loading dialog
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('拉取失败: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: AppConstants.spacingMd),
              ),
              child: const Text('拉取配置'),
            ),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          SwitchListTile(
            title: const Text('自动更新'),
            subtitle: const Text('启用后系统将定期自动拉取最新配置'),
            value: configService.autoUpdate,
            onChanged: configService.setAutoUpdate,
            activeThumbColor: Colors.green,
          ),
          const Divider(height: 32),
          Text(
            '配置内容',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            '可以手动编辑或粘贴配置 JSON，编辑完成后点击"保存配置"按钮应用',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.withOpacity(0.3)),
              borderRadius: BorderRadius.circular(AppConstants.radiusSm),
            ),
            child: TextField(
              controller: _configJsonController,
              maxLines: 15,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
              ),
              decoration: const InputDecoration(
                hintText: '{\n  "api_site": {\n    "example": {\n      "name": "示例源",\n      "api": "https://...",\n      "detail": "https://..."\n    }\n  }\n}',
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(AppConstants.spacingMd),
              ),
            ),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _configJsonController.clear,
                  icon: const Icon(Icons.clear),
                  label: const Text('清空'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: AppConstants.spacingMd),
                  ),
                ),
              ),
              const SizedBox(width: AppConstants.spacingMd),
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final jsonText = _configJsonController.text.trim();
                    if (jsonText.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('配置内容为空'),
                          backgroundColor: Colors.orange,
                        ),
                      );
                      return;
                    }

                    // Show loading dialog
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => const Center(
                        child: CircularProgressIndicator(),
                      ),
                    );

                    try {
                      // Parse JSON
                      final config = json.decode(jsonText) as Map<String, dynamic>;

                      // Apply configuration
                      await configService.applyConfiguration(config, apiSourceService);

                      if (context.mounted) {
                        Navigator.pop(context); // Close loading dialog
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('配置保存成功！'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        Navigator.pop(context); // Close loading dialog
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('保存失败: $e'),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    }
                  },
                  icon: const Icon(Icons.save),
                  label: const Text('保存配置'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: AppConstants.spacingMd),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSiteConfigContent(
    BuildContext context,
    settings.AppSettingsService settingsService,
  ) {
    final siteService = context.watch<SiteConfigService>();

    return Padding(
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '站点名称',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppConstants.spacingSm),
          TextField(
            controller: _siteNameController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.all(AppConstants.spacingMd),
            ),
            onChanged: (value) {
              if (value.trim().isNotEmpty) {
                siteService.setSiteName(value);
              }
            },
          ),
          const SizedBox(height: AppConstants.spacingMd),
          Text(
            '豆瓣数据代理',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.withOpacity(0.3)),
              borderRadius: BorderRadius.circular(AppConstants.radiusSm),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<DoubanProxyType>(
                value: settingsService.doubanProxyType,
                isExpanded: true,
                padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
                items: const [
                  DropdownMenuItem(
                    value: DoubanProxyType.corsProxyZwei,
                    child: Text('CORS Proxy (推荐)'),
                  ),
                  DropdownMenuItem(
                    value: DoubanProxyType.cmliusssCdnTencent,
                    child: Text('豆瓣 CDN By CMLiussss (腾讯云)'),
                  ),
                  DropdownMenuItem(
                    value: DoubanProxyType.cmliusssCdnAli,
                    child: Text('豆瓣 CDN By CMLiussss (阿里云)'),
                  ),
                  DropdownMenuItem(
                    value: DoubanProxyType.direct,
                    child: Text('直连 (可能被封)'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    settingsService.setDoubanProxyType(value);
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            '选择获取豆瓣数据的方式',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          if (settingsService.doubanProxyType == DoubanProxyType.cmliusssCdnTencent) ...[
            const SizedBox(height: AppConstants.spacingSm),
            Row(
              children: [
                Text(
                  'Thanks to @CMLiussss',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.blue,
                      ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.open_in_new, size: 14, color: Colors.blue),
              ],
            ),
          ],
          const SizedBox(height: AppConstants.spacingMd),
          Text(
            '站点缓存存储时间 (秒)',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppConstants.spacingSm),
          TextField(
            controller: _cacheTimeController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.all(AppConstants.spacingMd),
            ),
            onChanged: (value) {
              final seconds = int.tryParse(value);
              if (seconds != null && seconds >= 0) {
                siteService.setCacheTime(seconds);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildVideoSourceContent(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Padding(
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '视频源列表',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('有效性检测 - Coming soon')),
                      );
                    },
                    icon: const Icon(Icons.check_circle_outline, size: 18),
                    label: const Text('有效性检测'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppConstants.spacingMd,
                        vertical: AppConstants.spacingSm,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppConstants.spacingSm),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ApiSourceManagementScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('添加视频源'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppConstants.spacingMd,
                        vertical: AppConstants.spacingSm,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppConstants.spacingMd),
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.withOpacity(0.3)),
              borderRadius: BorderRadius.circular(AppConstants.radiusSm),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppConstants.spacingMd),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.1),
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppConstants.radiusSm),
                    ),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 40),
                      Expanded(
                        flex: 2,
                        child: Text(
                          '名称',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          'KEY',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          'API 地址',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          '状态',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          '操作',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
                Consumer<ApiSourceService>(
                  builder: (context, apiSourceService, child) {
                    if (apiSourceService.sources.isEmpty) {
                      return Padding(
                        padding: const EdgeInsets.all(AppConstants.spacingLg),
                        child: Text(
                          loc.noApiSources,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      );
                    }

                    return Column(
                      children: apiSourceService.sources.map((source) {
                        return Container(
                          padding: const EdgeInsets.all(AppConstants.spacingMd),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: Colors.grey.withOpacity(0.2),
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.drag_indicator, size: 20),
                              const SizedBox(width: 20),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  source.name,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  source.id.length > 6 ? source.id.substring(0, 6) : source.id,
                                  style: Theme.of(context).textTheme.bodySmall,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  source.apiUrl,
                                  style: Theme.of(context).textTheme.bodySmall,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: source.isActive ? Colors.green.withOpacity(0.2) : Colors.grey.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    source.isActive ? '已启用' : '已禁用',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                          color: source.isActive ? Colors.green : AppColors.textSecondary,
                                        ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              Expanded(
                                child: TextButton(
                                  onPressed: () {
                                    apiSourceService.toggleSourceActive(source.id);
                                  },
                                  style: TextButton.styleFrom(
                                    foregroundColor: source.isActive ? Colors.red : Colors.green,
                                    padding: EdgeInsets.zero,
                                  ),
                                  child: Text(source.isActive ? '禁用' : '启用'),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppearanceContent(
    BuildContext context,
    settings.AppSettingsService settingsService,
  ) {
    final loc = AppLocalizations.of(context);

    return Column(
      children: [
        RadioListTile<settings.AppThemeMode>(
          title: Text(loc.lightMode),
          value: settings.AppThemeMode.light,
          groupValue: settingsService.themeMode,
          onChanged: (value) {
            if (value != null) {
              settingsService.setThemeMode(value);
            }
          },
          activeColor: AppColors.accent,
        ),
        const Divider(height: 1),
        RadioListTile<settings.AppThemeMode>(
          title: Text(loc.darkMode),
          value: settings.AppThemeMode.dark,
          groupValue: settingsService.themeMode,
          onChanged: (value) {
            if (value != null) {
              settingsService.setThemeMode(value);
            }
          },
          activeColor: AppColors.accent,
        ),
        const Divider(height: 1),
        RadioListTile<settings.AppThemeMode>(
          title: Text(loc.systemDefault),
          value: settings.AppThemeMode.system,
          groupValue: settingsService.themeMode,
          onChanged: (value) {
            if (value != null) {
              settingsService.setThemeMode(value);
            }
          },
          activeColor: AppColors.accent,
        ),
      ],
    );
  }

  Widget _buildLanguageContent(
    BuildContext context,
    settings.AppSettingsService settingsService,
  ) {
    final loc = AppLocalizations.of(context);

    return Column(
      children: [
        RadioListTile<String>(
          title: Text(loc.chinese),
          value: 'zh',
          groupValue: settingsService.locale.languageCode,
          onChanged: (value) {
            if (value != null) {
              settingsService.setLocale(Locale(value));
            }
          },
          activeColor: AppColors.accent,
        ),
        const Divider(height: 1),
        RadioListTile<String>(
          title: Text(loc.english),
          value: 'en',
          groupValue: settingsService.locale.languageCode,
          onChanged: (value) {
            if (value != null) {
              settingsService.setLocale(Locale(value));
            }
          },
          activeColor: AppColors.accent,
        ),
      ],
    );
  }

  Widget _buildAboutOptions(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Column(
      children: [
        ListTile(
          leading: const Icon(Icons.help_outline_rounded),
          title: Text(loc.helpSupport),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${loc.helpSupport} - Coming soon'),
                backgroundColor: AppColors.accent,
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: const Icon(Icons.privacy_tip_outlined),
          title: Text(loc.privacyPolicy),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${loc.privacyPolicy} - Coming soon'),
                backgroundColor: AppColors.accent,
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: const Icon(Icons.description_outlined),
          title: Text(loc.termsOfService),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${loc.termsOfService} - Coming soon'),
                backgroundColor: AppColors.accent,
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
        ),
        const Divider(height: 1),
        ListTile(
          leading: const Icon(Icons.info_outline_rounded),
          title: Text(loc.about),
          subtitle: Text('${loc.version} ${AppConstants.appVersion}'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            showAboutDialog(
              context: context,
              applicationName: AppConstants.appName,
              applicationVersion: AppConstants.appVersion,
              applicationIcon: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.movie_rounded,
                  size: 32,
                  color: Colors.white,
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
