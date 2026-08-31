"""
从 English-words-pronunciation-mp3-audio-download 的 data.json（119K 词，7 个词典源）
查找失败词的多词典 URL，下载到 public/audio/
"""

import json
import os
import sys
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

DATA_JSON_URL = "https://raw.githubusercontent.com/thousandlemons/English-words-pronunciation-mp3-audio-download/master/data.json"
FAILED_FILE = Path(__file__).parent.parent / "public" / "audio" / "_failed.txt"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio"

def download_data_json():
    """下载 data.json（10.6 MB，119K 词）"""
    json_path = Path(__file__).parent / "data.json"
    if json_path.exists():
        print(f"📦 使用本地缓存: {json_path}")
        return json_path

    print(f"⬇️  下载 {DATA_JSON_URL}...")
    req = Request(DATA_JSON_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=60) as r:
        data = r.read()
    json_path.write_bytes(data)
    print(f"✅ 下载完成 ({len(data) / 1024 / 1024:.1f} MB)")
    return json_path

def try_download(url, save_path):
    """尝试从 URL 下载 MP3"""
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=15) as r:
            data = r.read()
        if len(data) > 1024:  # 至少 1 KB 才是有效音频
            save_path.write_bytes(data)
            return True
    except Exception:
        pass
    return False

def main():
    if not FAILED_FILE.exists():
        print("❌ 没有失败记录文件")
        return

    failed_words = [w.strip() for w in FAILED_FILE.read_text("utf-8").splitlines() if w.strip()]
    print(f"📚 待补充: {len(failed_words)} 个词")

    # 下载 data.json
    json_path = download_data_json()
    lookup = json.loads(json_path.read_text("utf-8"))
    print(f"🔍 data.json 共 {len(lookup)} 个词条")

    # 逐个查找并下载
    success = 0
    still_failed = []

    for i, word in enumerate(failed_words):
        # 检查是否已下载
        mp3_path = OUTPUT_DIR / f"{word}.mp3"
        if mp3_path.exists():
            success += 1
            continue

        # 查找 URL
        urls = lookup.get(word, [])
        if isinstance(urls, str):
            urls = [urls]

        if not urls:
            still_failed.append(word)
            continue

        # 依次尝试每个 URL
        downloaded = False
        for url in urls:
            if try_download(url, mp3_path):
                kb = mp3_path.stat().st_size / 1024
                print(f"  ✓ {word} ({kb:.0f} KB)")
                downloaded = True
                success += 1
                break

        if not downloaded:
            still_failed.append(word)
            print(f"  ✗ {word}")

        # 每 20 个词休息 1 秒
        if (i + 1) % 20 == 0:
            time.sleep(1)

    # 更新失败记录
    if still_failed:
        FAILED_FILE.write_text("\n".join(still_failed) + "\n", "utf-8")
        print(f"\n⚠️  仍有 {len(still_failed)} 个词未找到")
    else:
        FAILED_FILE.unlink(missing_ok=True)
        print(f"\n🎉 全部补充成功！")

    total = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.mp3")) / (1024 * 1024)
    print(f"💾 音频文件夹总大小: {total:.1f} MB")
    print(f"📊 总计: {success}/{len(failed_words)} 成功")

if __name__ == "__main__":
    main()