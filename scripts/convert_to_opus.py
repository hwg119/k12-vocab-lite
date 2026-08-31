"""将 public/audio/ 下的所有 MP3 转换为 Opus 24kbps，替换原文件"""
import subprocess
import sys
from pathlib import Path

FFMPEG = Path(__file__).parent / "ffmpeg.exe"
AUDIO_DIR = Path(__file__).parent.parent / "public" / "audio"

def main():
    if not FFMPEG.exists():
        print(f"❌ ffmpeg 未找到: {FFMPEG}")
        print("请先下载 ffmpeg 到 scripts/ 目录")
        sys.exit(1)

    mp3_files = sorted(AUDIO_DIR.glob("*.mp3"))
    if not mp3_files:
        print("❌ 没有 MP3 文件")
        return

    total = len(mp3_files)
    skip = 0
    convert = 0
    orig_size = 0
    new_size = 0

    for i, mp3 in enumerate(mp3_files):
        opus = mp3.with_suffix(".opus")
        orig_size += mp3.stat().st_size

        if opus.exists():
            # 如果 Opus 已经存在且比 MP3 小，跳过
            if opus.stat().st_size < mp3.stat().st_size:
                skip += 1
                new_size += opus.stat().st_size
                continue

        # 转换：MP3 → Opus 24kbps
        result = subprocess.run(
            [str(FFMPEG), "-y", "-i", str(mp3),
             "-c:a", "libopus", "-b:a", "24k", "-vbr", "on",
             str(opus)],
            capture_output=True, text=True, timeout=30
        )

        if result.returncode == 0 and opus.exists():
            old_kb = mp3.stat().st_size / 1024
            new_kb = opus.stat().st_size / 1024
            new_size += opus.stat().st_size
            mp3.unlink()  # 删除原 MP3
            convert += 1
            if (i + 1) % 200 == 0:
                print(f"  [{i+1}/{total}] 已转换 {convert} 个...")
        else:
            print(f"  ✗ 转换失败: {mp3.name}")

    total_new = sum(f.stat().st_size for f in AUDIO_DIR.glob("*.opus")) / (1024 * 1024)
    saved = (orig_size - new_size) / (1024 * 1024)

    print(f"\n{'='*40}")
    print(f"📊 完成:")
    print(f"   原 MP3 大小: {orig_size / 1024 / 1024:.1f} MB")
    print(f"   转换后大小:  {total_new:.1f} MB")
    print(f"   节省:        {saved:.1f} MB ({saved/(orig_size/1024/1024)*100:.0f}%)")
    print(f"   转换: {convert} 个, 跳过: {skip} 个")

if __name__ == "__main__":
    main()