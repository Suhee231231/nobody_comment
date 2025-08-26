# TWA (Trusted Web Activity) 설정 가이드

## 개요
TWA는 PWA를 네이티브 Android 앱으로 변환하는 Google의 공식 방법입니다.

## 필수 요구사항

### 1. 웹사이트 요구사항
- ✅ HTTPS 연결 (Vercel에서 제공)
- ✅ 유효한 manifest.json
- ✅ 서비스 워커 등록
- ✅ 적절한 아이콘 (192x192, 512x512)

### 2. 개발 환경 설정

#### Node.js 설치
```bash
# Node.js 16 이상 필요
node --version
```

#### Bubblewrap 설치
```bash
npm install -g @bubblewrap/cli
```

#### Android Studio 설치
- Android Studio 다운로드: https://developer.android.com/studio
- Android SDK 설치
- 환경 변수 설정

## TWA 빌드 과정

### 1. 초기 설정
```bash
cd frontend
bubblewrap init --manifest https://nobody-comment.vercel.app/manifest.json
```

### 2. 설정 확인
```bash
bubblewrap doctor
```

### 3. 앱 빌드
```bash
bubblewrap build
```

### 4. APK 생성
```bash
bubblewrap build --apk
```

### 5. AAB 생성 (Google Play Store용)
```bash
bubblewrap build --aab
```

## 설정 파일 설명

### bubblewrap.json
- `packageId`: 앱의 고유 식별자
- `host`: 웹사이트 도메인
- `name`: 앱 이름
- `themeColor`: 앱 테마 색상
- `enableNotifications`: 푸시 알림 활성화

### twa-manifest.json
- PWA manifest의 확장 버전
- TWA 전용 설정 포함

## Google Play Store 출시 준비

### 1. 앱 서명
```bash
# 키스토어 생성
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# AAB 서명
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.keystore app-release.aab my-key-alias
```

### 2. 앱 번들 최적화
```bash
# Android App Bundle 최적화
bundletool build-apks --bundle=app-release.aab --output=app-release.apks
```

## 문제 해결

### 일반적인 오류
1. **서비스 워커 오류**: manifest.json에서 serviceworker 필드 확인
2. **HTTPS 오류**: 웹사이트가 HTTPS로 제공되는지 확인
3. **아이콘 오류**: 필수 아이콘 크기가 제공되는지 확인

### 디버깅
```bash
# 상세 로그로 빌드
bubblewrap build --verbose

# 설정 검증
bubblewrap doctor --verbose
```

## 참고 자료
- [TWA 공식 문서](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Bubblewrap GitHub](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA Builder](https://www.pwabuilder.com/)

## 다음 단계
1. Bubblewrap 설치 및 초기 설정
2. 앱 빌드 및 테스트
3. Google Play Console에 앱 등록
4. 앱 스토어 메타데이터 준비
5. 출시 및 배포
