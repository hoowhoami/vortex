import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/app_localizations.dart';
import '../../services/api_source_service.dart';

class ApiSourceManagementScreen extends StatefulWidget {
  const ApiSourceManagementScreen({super.key});

  @override
  State<ApiSourceManagementScreen> createState() => _ApiSourceManagementScreenState();
}

class _ApiSourceManagementScreenState extends State<ApiSourceManagementScreen> {
  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final apiSourceService = context.watch<ApiSourceService>();

    return Scaffold(
      appBar: AppBar(
        title: Text(loc.apiSourceManagement),
        actions: [
          IconButton(
            icon: const Icon(Icons.upload_file),
            tooltip: loc.importConfig,
            onPressed: () => _showImportDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: loc.exportConfig,
            onPressed: () => _exportConfig(context),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'reset') {
                _showResetDialog(context);
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'reset',
                child: Row(
                  children: [
                    const Icon(Icons.restore, size: 20),
                    const SizedBox(width: AppConstants.spacingSm),
                    Text(loc.resetToDefaults),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: apiSourceService.sources.isEmpty
          ? _buildEmptyState(context)
          : ListView.builder(
              padding: const EdgeInsets.all(AppConstants.spacingMd),
              itemCount: apiSourceService.sources.length,
              itemBuilder: (context, index) {
                final source = apiSourceService.sources[index];
                final isActive = apiSourceService.activeSource?.id == source.id;

                return _buildSourceCard(context, source, isActive);
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddSourceDialog(context),
        icon: const Icon(Icons.add),
        label: Text(loc.addSource),
        backgroundColor: AppColors.accent,
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.cloud_off,
            size: 80,
            color: AppColors.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: AppConstants.spacingLg),
          Text(
            loc.noApiSources,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            loc.addSourceToGetStarted,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary.withOpacity(0.7),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildSourceCard(BuildContext context, ApiSource source, bool isActive) {
    final loc = AppLocalizations.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: AppConstants.spacingMd),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.radiusLg),
        side: isActive
            ? const BorderSide(color: AppColors.accent, width: 2)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: () async {
          if (!isActive) {
            await context.read<ApiSourceService>().setActiveSource(source.id);
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(loc.sourceActivated(source.name))),
              );
            }
          }
        },
        borderRadius: BorderRadius.circular(AppConstants.radiusLg),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.spacingMd),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                source.name,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (isActive) ...[
                              const SizedBox(width: AppConstants.spacingSm),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppConstants.spacingSm,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.accent,
                                  borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                                ),
                                child: Text(
                                  loc.active,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                            if (source.isDefault) ...[
                              const SizedBox(width: AppConstants.spacingSm),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppConstants.spacingSm,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.textSecondary.withOpacity(0.3),
                                  borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                                ),
                                child: Text(
                                  loc.defaultSource,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: AppConstants.spacingXs),
                        Text(
                          source.apiUrl,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (value) async {
                      switch (value) {
                        case 'edit':
                          _showEditSourceDialog(context, source);
                          break;
                        case 'test':
                          _testSource(context, source);
                          break;
                        case 'delete':
                          _showDeleteDialog(context, source);
                          break;
                      }
                    },
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            const Icon(Icons.edit, size: 20),
                            const SizedBox(width: AppConstants.spacingSm),
                            Text(loc.edit),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'test',
                        child: Row(
                          children: [
                            const Icon(Icons.network_check, size: 20),
                            const SizedBox(width: AppConstants.spacingSm),
                            Text(loc.testConnection),
                          ],
                        ),
                      ),
                      if (!source.isDefault)
                        PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              const Icon(Icons.delete, size: 20, color: Colors.red),
                              const SizedBox(width: AppConstants.spacingSm),
                              Text(loc.delete, style: const TextStyle(color: Colors.red)),
                            ],
                          ),
                        ),
                    ],
                  ),
                ],
              ),
              if (source.detailUrl != null) ...[
                const SizedBox(height: AppConstants.spacingXs),
                Text(
                  '${loc.detailUrl}: ${source.detailUrl}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary.withOpacity(0.7),
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showAddSourceDialog(BuildContext context) {
    _showSourceDialog(context, null);
  }

  void _showEditSourceDialog(BuildContext context, ApiSource source) {
    _showSourceDialog(context, source);
  }

  void _showSourceDialog(BuildContext context, ApiSource? existingSource) {
    final loc = AppLocalizations.of(context);
    final nameController = TextEditingController(text: existingSource?.name);
    final apiUrlController = TextEditingController(text: existingSource?.apiUrl);
    final detailUrlController = TextEditingController(text: existingSource?.detailUrl);
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(existingSource == null ? loc.addSource : loc.editSource),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: loc.sourceName,
                    hintText: loc.sourceNameHint,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return loc.pleaseEnterSourceName;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppConstants.spacingMd),
                TextFormField(
                  controller: apiUrlController,
                  decoration: InputDecoration(
                    labelText: loc.apiUrl,
                    hintText: 'https://api.example.com/api.php/provide/vod',
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return loc.pleaseEnterApiUrl;
                    }
                    try {
                      final uri = Uri.parse(value);
                      if (!uri.isAbsolute) {
                        return loc.invalidUrl;
                      }
                    } catch (e) {
                      return loc.invalidUrl;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppConstants.spacingMd),
                TextFormField(
                  controller: detailUrlController,
                  decoration: InputDecoration(
                    labelText: '${loc.detailUrl} (${loc.optional})',
                    hintText: 'https://api.example.com',
                    border: const OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(loc.cancel),
          ),
          FilledButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                final apiSourceService = context.read<ApiSourceService>();

                try {
                  if (existingSource == null) {
                    // Add new source
                    final id = DateTime.now().millisecondsSinceEpoch.toString();
                    await apiSourceService.addSource(
                      ApiSource(
                        id: id,
                        name: nameController.text.trim(),
                        apiUrl: apiUrlController.text.trim(),
                        detailUrl: detailUrlController.text.trim().isEmpty
                            ? null
                            : detailUrlController.text.trim(),
                      ),
                    );
                  } else {
                    // Update existing source
                    await apiSourceService.updateSource(
                      existingSource.id,
                      existingSource.copyWith(
                        name: nameController.text.trim(),
                        apiUrl: apiUrlController.text.trim(),
                        detailUrl: detailUrlController.text.trim().isEmpty
                            ? null
                            : detailUrlController.text.trim(),
                      ),
                    );
                  }

                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          existingSource == null
                              ? loc.sourceAdded
                              : loc.sourceUpdated,
                        ),
                      ),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('${loc.error}: $e')),
                    );
                  }
                }
              }
            },
            child: Text(existingSource == null ? loc.add : loc.save),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, ApiSource source) {
    final loc = AppLocalizations.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(loc.deleteSource),
        content: Text(loc.deleteSourceConfirm(source.name)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(loc.cancel),
          ),
          FilledButton(
            onPressed: () async {
              try {
                await context.read<ApiSourceService>().deleteSource(source.id);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(loc.sourceDeleted)),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${loc.error}: $e')),
                  );
                }
              }
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: Text(loc.delete),
          ),
        ],
      ),
    );
  }

  Future<void> _testSource(BuildContext context, ApiSource source) async {
    final loc = AppLocalizations.of(context);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final apiSourceService = context.read<ApiSourceService>();
    final isValid = await apiSourceService.testSource(source.apiUrl);

    if (context.mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isValid ? loc.connectionSuccessful : loc.connectionFailed,
          ),
          backgroundColor: isValid ? Colors.green : Colors.red,
        ),
      );
    }
  }

  void _showImportDialog(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final textController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(loc.importConfig),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              loc.importConfigDescription,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
            const SizedBox(height: AppConstants.spacingMd),
            TextField(
              controller: textController,
              decoration: InputDecoration(
                labelText: loc.configJson,
                hintText: '{"api_site": {...}}',
                border: const OutlineInputBorder(),
              ),
              maxLines: 10,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(loc.cancel),
          ),
          FilledButton(
            onPressed: () async {
              try {
                final config = json.decode(textController.text) as Map<String, dynamic>;
                await context.read<ApiSourceService>().importFromJson(config);

                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(loc.importSuccessful)),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${loc.importFailed}: $e')),
                  );
                }
              }
            },
            child: Text(loc.import_),
          ),
        ],
      ),
    );
  }

  void _exportConfig(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final apiSourceService = context.read<ApiSourceService>();
    final config = apiSourceService.exportToJson();
    final configJson = const JsonEncoder.withIndent('  ').convert(config);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(loc.exportConfig),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              loc.exportConfigDescription,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
            const SizedBox(height: AppConstants.spacingMd),
            Container(
              padding: const EdgeInsets.all(AppConstants.spacingSm),
              decoration: BoxDecoration(
                color: Colors.black12,
                borderRadius: BorderRadius.circular(AppConstants.radiusSm),
              ),
              child: SelectableText(
                configJson,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(loc.close),
          ),
          FilledButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: configJson));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(loc.copiedToClipboard)),
              );
            },
            child: Text(loc.copy),
          ),
        ],
      ),
    );
  }

  void _showResetDialog(BuildContext context) {
    final loc = AppLocalizations.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(loc.resetToDefaults),
        content: Text(loc.resetToDefaultsConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(loc.cancel),
          ),
          FilledButton(
            onPressed: () async {
              await context.read<ApiSourceService>().resetToDefaults();
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(loc.resetSuccessful)),
                );
              }
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.orange),
            child: Text(loc.reset),
          ),
        ],
      ),
    );
  }
}
