package com.hwg119.k12.vocab;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * 数据安全：接管 WebView 下载，把网页导出的 data: URL 备份解码后写入公共 Download 目录。
 * 这样即使应用被卸载，备份文件仍留在手机 Download 里，重装/换机后可重新导入，保证数据不丢失。
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            if (url == null || !url.startsWith("data:")) {
                return;
            }
            try {
                int comma = url.indexOf(',');
                if (comma < 0) return;
                String meta = url.substring(5, comma);
                String payload = url.substring(comma + 1);
                byte[] bytes;
                if (meta.contains("base64")) {
                    bytes = Base64.decode(payload, Base64.DEFAULT | Base64.NO_WRAP);
                } else {
                    bytes = payload.getBytes(StandardCharsets.UTF_8);
                }
                String ts = new SimpleDateFormat("yyyyMMdd-HHmmss", Locale.US).format(new Date());
                String fileName = "k12-vocab-backup-" + ts + ".json";
                writePublicDownload(fileName, bytes);
            } catch (Exception ignored) {
            }
        });
    }

    private void writePublicDownload(String fileName, byte[] bytes) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
            values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) return;
            try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                if (os != null) os.write(bytes);
            } catch (Exception ignored) {
            }
            return;
        }
        // 旧系统：写应用外部文件目录（Download 子目录），无需存储权限
        try {
            File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) != null
                    ? getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) : getFilesDir(), "Download");
            if (!dir.exists()) dir.mkdirs();
            try (FileOutputStream fos = new FileOutputStream(new File(dir, fileName))) {
                fos.write(bytes);
            }
        } catch (Exception ignored) {
        }
    }
}