"""下载词库中所有单词的美式发音 MP3 到 public/audio/"""

import os
import sys
import time
from pathlib import Path
from google_pronouncer import GooglePronunciationDownloader, DownloadConfig, AccentType

# 配置
WORDS_FILE = Path(__file__).parent / "words.txt"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio"
PARALLEL_JOBS = 8

def main():
    if not WORDS_FILE.exists():
        print(f"❌ 找不到 {WORDS_FILE}，先运行 extract_words.js")
        sys.exit(1)

    words = [w.strip() for w in WORDS_FILE.read_text("utf-8").splitlines() if w.strip()]
    print(f"📚 共 {len(words)} 个单词")

    # 统计已下载的
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    existing = set()
    for f in OUTPUT_DIR.glob("*.mp3"):
        existing.add(f.stem.replace("_us", ""))
    remaining = [w for w in words if w not in existing]
    print(f"✅ 已下载 {len(existing)} 个，待下载 {len(remaining)} 个")

    if not remaining:
        print("🎉 全部已下载！")
        return

    # 配置下载器
    config = DownloadConfig(
        output_dir=str(OUTPUT_DIR),
        timeout=10,
        use_cache=True,
        force_download=False,
    )
    downloader = GooglePronunciationDownloader(config)

    # 分批次下载，避免 Google 限流
    BATCH_SIZE = 100
    total = len(remaining)
    success = 0
    failed = 0

    for i in range(0, total, BATCH_SIZE):
        batch = remaining[i:i + BATCH_SIZE]
        print(f"\n--- 批次 {i//BATCH_SIZE + 1}/{(total + BATCH_SIZE - 1)//BATCH_SIZE} ({len(batch)} 词) ---")

        for word in batch:
            try:
                path = downloader.download_pronunciation(word, AccentType.AMERICAN)
                # 重命名去掉 _us 后缀
                src = Path(path)
                dst = src.parent / f"{word}.mp3"
                if src != dst:
                    if dst.exists():
                        dst.unlink()
                    src.rename(dst)
                success += 1
                print(f"  ✓ {word}")
            except Exception as e:
                failed += 1
                print(f"  ✗ {word}: {e}")
                # 失败时写入日志
                with open(OUTPUT_DIR / "_failed.txt", "a") as f:
                    f.write(f"{word}\n")

        # 每批之间短暂休眠
        if i + BATCH_SIZE < total:
            time.sleep(2)

    print(f"\n{'='*40}")
    print(f"📊 完成: 成功 {success}, 失败 {failed}, 总计 {len(remaining)}")
    if failed > 0:
        print(f"⚠️  失败列表: {OUTPUT_DIR / '_failed.txt'}")

    # 统计总大小
    total_size = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.mp3")) / (1024 * 1024)
    print(f"💾 音频文件夹总大小: {total_size:.1f} MB")

if __name__ == "__main__":
    main()