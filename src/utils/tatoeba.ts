// Tatoeba 真人例句发音 API
// https://tatoeba.org/ 开源协作平台，真人用户录制发音，CC BY 许可
// API 文档: https://en.wiki.tatoeba.org/articles/show/api
//
// 实测要点（国内环境验证）：
//   - 音频真实 URL 必须带 /en/ 前缀：
//       https://tatoeba.org/en/audio/download/{audioId}  (200, audio/mpeg)
//     https://tatoeba.org/audio/download/{audioId}      (301 重定向，需避免)
//     audio.tatoeba.org/sentences/*.mp3                 (404，不可用)
//   - 搜索方向用 to=cmn（普通话）比 to=zho 的英文带音频命中率高很多
//   - 默认搜索结果第 1 页常无英文带音频句，需翻页兜底

export interface CachedTatoebaSentence {
  sentenceId: number;
  text: string;
  textCn: string;
  audioUrl: string;
  cachedAt: number;
}

// 缓存到 localStorage，key 前缀
const CACHE_KEY_PREFIX = 'vocab-tatoeba-cache-';
// 合法音频 URL 前缀（旧代码曾缓存 /audio/download/{id} 的错误 301 链接，须剔除）
const AUDIO_URL_PREFIX = 'https://tatoeba.org/en/audio/download/';
// 最多翻几页找带音频的英文句
const MAX_SEARCH_PAGES = 6;

function isValidAudioUrl(url: string): boolean {
  return url.startsWith(AUDIO_URL_PREFIX);
}

// 从当前学段的搜索结果中提取第一个"英文且有发声 + 尽量带中文翻译"的句子
function pickFirstWithAudio(results: unknown[]): CachedTatoebaSentence | null {
  for (const result of results) {
    if (typeof result !== 'object' || result === null) continue;
    const r = result as {
      id?: number;
      lang?: string;
      text?: string;
      audios?: { id?: number }[];
      translations?: { lang?: string; text?: string }[][];
    };
    if (r.lang !== 'eng') continue;
    if (!r.audios || r.audios.length === 0) continue;
    const audioId = r.audios[0]?.id;
    if (!audioId) continue;

    // 尽量找中文翻译
    let textCn = '';
    for (const transGroup of r.translations || []) {
      for (const trans of transGroup) {
        if (trans && (trans.lang === 'zho' || trans.lang === 'cmn') && trans.text) {
          textCn = trans.text;
          break;
        }
      }
      if (textCn) break;
    }

    return {
      sentenceId: r.id ?? 0,
      text: r.text ?? '',
      textCn,
      audioUrl: `${AUDIO_URL_PREFIX}${audioId}`,
      cachedAt: Date.now(),
    };
  }
  return null;
}

// 从 Tatoeba 搜索包含指定单词的例句，返回第一个带发音的
export async function fetchFirstTatoebaSentenceWithAudio(
  word: string
): Promise<CachedTatoebaSentence | null> {
  try {
    // 按页搜索，命中带音频的英文句即停
    for (let page = 1; page <= MAX_SEARCH_PAGES; page++) {
      const url =
        `https://tatoeba.org/en/api_v0/search` +
        `?from=eng&to=cmn&query=${encodeURIComponent(word)}&page=${page}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        console.warn(`[Tatoeba] fetch failed for ${word} (page ${page}):`, resp.status);
        break;
      }
      const data = await resp.json();
      const results = (data as { results?: unknown[] }).results || [];
      if (results.length === 0) break;

      const hit = pickFirstWithAudio(results);
      if (hit) {
        // 缓存
        try {
          localStorage.setItem(CACHE_KEY_PREFIX + word, JSON.stringify(hit));
        } catch {
          /* 忽略存储失败（如隐私模式） */
        }
        return hit;
      }
    }
    return null;
  } catch (e) {
    console.warn(`[Tatoeba] error fetching for ${word}:`, e);
    return null;
  }
}

// 读缓存：只认合法的音频 URL，历史坏缓存（301/404 链接）视为无效，触发重新拉取
export function getCachedTatoebaSentence(word: string): CachedTatoebaSentence | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + word);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedTatoebaSentence;
    if (!cached.audioUrl || !isValidAudioUrl(cached.audioUrl)) {
      localStorage.removeItem(CACHE_KEY_PREFIX + word);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

// 清除缓存
export function clearTatoebaCache(word?: string) {
  if (word) {
    localStorage.removeItem(CACHE_KEY_PREFIX + word);
  } else {
    // 清除全部
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}