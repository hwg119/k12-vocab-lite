"""通过代理重试失败下载的单词"""
import os
import sys
from pathlib import Path
from google_pronouncer import GooglePronunciationDownloader, DownloadConfig, AccentType

# 配置代理
PROXY = "http://localhost:7890"
os.environ["HTTP_PROXY"] = PROXY
os.environ["HTTPS_PROXY"] = PROXY

FAILED_FILE = Path(__file__).parent.parent / "public" / "audio" / "_failed.txt"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio"

def main():
    if not FAILED_FILE.exists():
        print("❌ 没有失败记录文件")
        return

    words = [w.strip() for w in FAILED_FILE.read_text("utf-8").splitlines() if w.strip()]
    print(f"📚 重试 {len(words)} 个失败单词（代理: {PROXY}）")

    # 过滤已下载的
    existing = {f.stem for f in OUTPUT_DIR.glob("*.mp3")}
    remaining = [w for w in words if w not in existing]
    print(f"待下载: {len(remaining)} 个")

    if not remaining:
        print("🎉 全部已下载！")
        FAILED_FILE.unlink(missing_ok=True)
        return

    config = DownloadConfig(
        output_dir=str(OUTPUT_DIR),
        timeout=15,
        use_cache=False,
        force_download=True,
    )
    downloader = GooglePronunciationDownloader(config)

    success = 0
    failed = []
    for word in remaining:
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
            print(f"  ✓ {word} ({os.path.getsize(dst) / 1024:.0f} KB)")
        except Exception as e:
            failed.append(word)
            print(f"  ✗ {word}: {e}")

    # 更新失败记录
    if failed:
        FAILED_FILE.write_text("\n".join(failed) + "\n", "utf-8")
        print(f"\n⚠️  仍有 {len(failed)} 个失败，已保存到 _failed.txt")
    else:
        FAILED_FILE.unlink(missing_ok=True)
        print(f"\n🎉 全部重试成功！")

    total = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.mp3")) / (1024 * 1024)
    print(f"💾 音频文件夹总大小: {total:.1f} MB")

if __name__ == "__main__":
    main()