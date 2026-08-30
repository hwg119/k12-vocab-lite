/**
 * 应用版本号（单一来源：package.json → vite.config.ts 的 define 注入）
 *
 * Android 端需与 android/app/build.gradle 的 versionName 保持一致：
 *   - package.json → "version": "1.1.0"
 *   - build.gradle → versionName "1.1.0"，versionCode 2
 *
 * 修改步骤：
 *   1. 改 package.json 里的 "version"
 *   2. 同步改 android/app/build.gradle 里的 versionCode + versionName
 *   3. 重新 npm run build → npx cap sync android → gradlew assembleRelease
 */

/** 应用版本号，由 Vite 构建时注入 */
export const APP_VERSION: string =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PACKAGE_VERSION) || '0.0.0';

/** Android 端期望的版本号（必须与 build.gradle 一致） */
export const LATEST_VERSION: string = '1.7.0';

/** 当前是否为最新版本 */
export function isUpToDate(): boolean {
  return APP_VERSION === LATEST_VERSION;
}

/** 平台标识 */
export const PLATFORM: 'android' | 'web' =
  typeof navigator !== 'undefined' && /capacitor/i.test(navigator.userAgent)
    ? 'android'
    : 'web';