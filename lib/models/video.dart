import 'package:equatable/equatable.dart';

/// Video model for Apple CMS V10 API format
class Video extends Equatable { // vod_rel_art

  const Video({
    required this.id,
    required this.name,
    this.subName = '',
    this.enName = '',
    required this.pic,
    this.picThumb,
    this.picSlide,
    this.picScreenshot,
    this.type = '',
    this.typeId = 0,
    this.area,
    this.lang,
    this.year,
    this.director,
    this.actor,
    this.content,
    this.blurb,
    this.remarks,
    this.playUrl,
    this.playFrom,
    this.score = 0.0,
    this.scoreAll = 0,
    this.scoreNum = 0,
    this.state,
    this.tag,
    this.writer,
    this.duration,
    this.doubanId,
    this.doubanScore,
    this.pubdate,
    this.total,
    this.serial,
    this.weekday,
    this.time,
    this.timeAdd,
    this.timeHits,
    this.timeMake,
    this.hits,
    this.hitsDay,
    this.hitsWeek,
    this.hitsMonth,
    this.up,
    this.down,
    this.level,
    this.copyright,
    this.jumpurl,
    this.letter,
    this.version,
    this.reurl,
    this.relVod,
    this.relArt,
  });

  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      id: _parseInt(json['vod_id']),
      name: json['vod_name'] as String? ?? '',
      subName: json['vod_sub'] as String? ?? '',
      enName: json['vod_en'] as String? ?? '',
      pic: json['vod_pic'] as String? ?? '',
      picThumb: json['vod_pic_thumb'] as String?,
      picSlide: json['vod_pic_slide'] as String?,
      picScreenshot: json['vod_pic_screenshot'] as String?,
      type: json['vod_class'] as String? ?? json['type_name'] as String? ?? '',
      typeId: _parseInt(json['type_id'] ?? json['vod_type']),
      area: _parseStringNullable(json['vod_area']),
      lang: _parseStringNullable(json['vod_lang']),
      year: _parseStringNullable(json['vod_year']),
      director: _parseStringNullable(json['vod_director']),
      actor: _parseStringNullable(json['vod_actor']),
      content: _parseStringNullable(json['vod_content']),
      blurb: _parseStringNullable(json['vod_blurb']),
      remarks: _parseStringNullable(json['vod_remarks']),
      playUrl: _parseStringNullable(json['vod_play_url']),
      playFrom: _parseStringNullable(json['vod_play_from']),
      score: _parseDouble(json['vod_score']),
      scoreAll: _parseInt(json['vod_score_all']),
      scoreNum: _parseInt(json['vod_score_num']),
      state: _parseStringNullable(json['vod_state']),
      tag: _parseStringNullable(json['vod_tag']),
      writer: _parseStringNullable(json['vod_writer']),
      duration: _parseStringNullable(json['vod_duration']),
      doubanId: _parseStringNullable(json['vod_douban_id']),
      doubanScore: _parseDoubleNullable(json['vod_douban_score']),
      pubdate: _parseStringNullable(json['vod_pubdate']),
      total: _parseStringNullable(json['vod_total']),
      serial: _parseStringNullable(json['vod_serial']),
      weekday: _parseStringNullable(json['vod_weekday']),
      time: _parseStringNullable(json['vod_time']),
      timeAdd: _parseStringNullable(json['vod_time_add']),
      timeHits: _parseStringNullable(json['vod_time_hits']),
      timeMake: _parseStringNullable(json['vod_time_make']),
      hits: _parseIntNullable(json['vod_hits']),
      hitsDay: _parseIntNullable(json['vod_hits_day']),
      hitsWeek: _parseIntNullable(json['vod_hits_week']),
      hitsMonth: _parseIntNullable(json['vod_hits_month']),
      up: _parseIntNullable(json['vod_up']),
      down: _parseIntNullable(json['vod_down']),
      level: _parseStringNullable(json['vod_level']),
      copyright: _parseStringNullable(json['vod_copyright']),
      jumpurl: _parseStringNullable(json['vod_jumpurl']),
      letter: _parseStringNullable(json['vod_letter']),
      version: _parseStringNullable(json['vod_version']),
      reurl: _parseStringNullable(json['vod_reurl']),
      relVod: _parseStringNullable(json['vod_rel_vod']),
      relArt: _parseStringNullable(json['vod_rel_art']),
    );
  }
  final int id;
  final String name; // vod_name
  final String subName; // vod_sub
  final String enName; // vod_en
  final String pic; // vod_pic
  final String? picThumb; // vod_pic_thumb
  final String? picSlide; // vod_pic_slide
  final String? picScreenshot; // vod_pic_screenshot
  final String type; // vod_class
  final int typeId; // vod_type
  final String? area; // vod_area
  final String? lang; // vod_lang
  final String? year; // vod_year
  final String? director; // vod_director
  final String? actor; // vod_actor
  final String? content; // vod_content
  final String? blurb; // vod_blurb
  final String? remarks; // vod_remarks
  final String? playUrl; // vod_play_url
  final String? playFrom; // vod_play_from
  final double score; // vod_score
  final int scoreAll; // vod_score_all
  final int scoreNum; // vod_score_num
  final String? state; // vod_state
  final String? tag; // vod_tag
  final String? writer; // vod_writer
  final String? duration; // vod_duration
  final String? doubanId; // vod_douban_id
  final double? doubanScore; // vod_douban_score
  final String? pubdate; // vod_pubdate
  final String? total; // vod_total
  final String? serial; // vod_serial
  final String? weekday; // vod_weekday
  final String? time; // vod_time
  final String? timeAdd; // vod_time_add
  final String? timeHits; // vod_time_hits
  final String? timeMake; // vod_time_make
  final int? hits; // vod_hits
  final int? hitsDay; // vod_hits_day
  final int? hitsWeek; // vod_hits_week
  final int? hitsMonth; // vod_hits_month
  final int? up; // vod_up
  final int? down; // vod_down
  final String? level; // vod_level
  final String? copyright; // vod_copyright
  final String? jumpurl; // vod_jumpurl
  final String? letter; // vod_letter
  final String? version; // vod_version
  final String? reurl; // vod_reurl
  final String? relVod; // vod_rel_vod
  final String? relArt;

  Map<String, dynamic> toJson() {
    return {
      'vod_id': id,
      'vod_name': name,
      'vod_sub': subName,
      'vod_en': enName,
      'vod_pic': pic,
      'vod_pic_thumb': picThumb,
      'vod_pic_slide': picSlide,
      'vod_pic_screenshot': picScreenshot,
      'vod_class': type,
      'type_id': typeId,
      'vod_area': area,
      'vod_lang': lang,
      'vod_year': year,
      'vod_director': director,
      'vod_actor': actor,
      'vod_content': content,
      'vod_blurb': blurb,
      'vod_remarks': remarks,
      'vod_play_url': playUrl,
      'vod_play_from': playFrom,
      'vod_score': score,
      'vod_score_all': scoreAll,
      'vod_score_num': scoreNum,
      'vod_state': state,
      'vod_tag': tag,
      'vod_writer': writer,
      'vod_duration': duration,
      'vod_douban_id': doubanId,
      'vod_douban_score': doubanScore,
      'vod_pubdate': pubdate,
      'vod_total': total,
      'vod_serial': serial,
      'vod_weekday': weekday,
      'vod_time': time,
      'vod_time_add': timeAdd,
      'vod_time_hits': timeHits,
      'vod_time_make': timeMake,
      'vod_hits': hits,
      'vod_hits_day': hitsDay,
      'vod_hits_week': hitsWeek,
      'vod_hits_month': hitsMonth,
      'vod_up': up,
      'vod_down': down,
      'vod_level': level,
      'vod_copyright': copyright,
      'vod_jumpurl': jumpurl,
      'vod_letter': letter,
      'vod_version': version,
      'vod_reurl': reurl,
      'vod_rel_vod': relVod,
      'vod_rel_art': relArt,
    };
  }

  // Helper methods for parsing
  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is String) return int.tryParse(value) ?? 0;
    if (value is double) return value.toInt();
    return 0;
  }

  static int? _parseIntNullable(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    if (value is double) return value.toInt();
    return null;
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0;
  }

  static double? _parseDoubleNullable(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  static String? _parseStringNullable(dynamic value) {
    if (value == null) return null;
    if (value is String) return value;
    if (value is int) return value.toString();
    if (value is double) return value.toString();
    if (value is bool) return value.toString();
    return value.toString();
  }

  // Computed properties
  String get posterUrl => pic.isNotEmpty ? pic : '';

  String get backdropUrl =>
      picSlide?.isNotEmpty == true ? picSlide! : pic;

  String get displayYear => year ?? '';

  String get formattedScore {
    if (doubanScore != null && doubanScore! > 0) {
      return doubanScore!.toStringAsFixed(1);
    }
    if (score > 0) {
      return score.toStringAsFixed(1);
    }
    return '0.0';
  }

  double get displayScore => doubanScore ?? score;

  String get displayRemarks => remarks ?? '';

  List<String> get actorList {
    if (actor == null || actor!.isEmpty) return [];
    return actor!.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
  }

  List<String> get directorList {
    if (director == null || director!.isEmpty) return [];
    return director!.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
  }

  List<String> get typeList {
    if (type.isEmpty) return [];
    return type.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
  }

  String get displayContent => content ?? blurb ?? '';

  @override
  List<Object?> get props => [
        id,
        name,
        subName,
        enName,
        pic,
        picThumb,
        picSlide,
        picScreenshot,
        type,
        typeId,
        area,
        lang,
        year,
        director,
        actor,
        content,
        blurb,
        remarks,
        playUrl,
        playFrom,
        score,
        scoreAll,
        scoreNum,
        state,
        tag,
        writer,
        duration,
        doubanId,
        doubanScore,
        pubdate,
        total,
        serial,
        weekday,
        time,
        timeAdd,
        timeHits,
        timeMake,
        hits,
        hitsDay,
        hitsWeek,
        hitsMonth,
        up,
        down,
        level,
        copyright,
        jumpurl,
        letter,
        version,
        reurl,
        relVod,
        relArt,
      ];
}

/// Video category model
class VideoCategory extends Equatable {

  const VideoCategory({
    required this.id,
    required this.name,
    this.enName,
    this.pid,
    this.pic,
  });

  factory VideoCategory.fromJson(Map<String, dynamic> json) {
    return VideoCategory(
      id: Video._parseInt(json['type_id']),
      name: json['type_name'] as String? ?? '',
      enName: json['type_en'] as String?,
      pid: Video._parseIntNullable(json['type_pid']),
      pic: json['type_pic'] as String?,
    );
  }
  final int id;
  final String name;
  final String? enName;
  final int? pid;
  final String? pic;

  Map<String, dynamic> toJson() {
    return {
      'type_id': id,
      'type_name': name,
      'type_en': enName,
      'type_pid': pid,
      'type_pic': pic,
    };
  }

  @override
  List<Object?> get props => [id, name, enName, pid, pic];
}

/// API response model for Apple CMS V10
class VideoApiResponse extends Equatable {

  const VideoApiResponse({
    required this.code,
    required this.msg,
    required this.page,
    required this.pagecount,
    required this.limit,
    required this.total,
    required this.list,
    this.categories,
  });

  factory VideoApiResponse.fromJson(Map<String, dynamic> json) {
    return VideoApiResponse(
      code: Video._parseInt(json['code']),
      msg: json['msg'] as String? ?? '',
      page: Video._parseInt(json['page'] ?? 1),
      pagecount: Video._parseInt(json['pagecount']),
      limit: Video._parseInt(json['limit'] ?? 20),
      total: Video._parseInt(json['total']),
      list: (json['list'] as List<dynamic>?)
              ?.map((e) => Video.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      categories: (json['class'] as List<dynamic>?)
          ?.map((e) => VideoCategory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
  final int code;
  final String msg;
  final int page;
  final int pagecount;
  final int limit;
  final int total;
  final List<Video> list;
  final List<VideoCategory>? categories;

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'msg': msg,
      'page': page,
      'pagecount': pagecount,
      'limit': limit,
      'total': total,
      'list': list.map((e) => e.toJson()).toList(),
      'class': categories?.map((e) => e.toJson()).toList(),
    };
  }

  @override
  List<Object?> get props => [code, msg, page, pagecount, limit, total, list, categories];
}
