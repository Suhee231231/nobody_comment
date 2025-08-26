#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TWA 설정 시작...\n');

// 필수 파일 확인
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'bubblewrap.json',
  'twa-manifest.json'
];

console.log('📋 필수 파일 확인 중...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 파일이 없습니다!`);
    process.exit(1);
  }
});

// Node.js 버전 확인
console.log('\n📦 Node.js 버전 확인 중...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    console.log('❌ Node.js 16 이상이 필요합니다!');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Node.js가 설치되지 않았습니다!');
  process.exit(1);
}

// Bubblewrap 설치 확인
console.log('\n🔧 Bubblewrap 설치 확인 중...');
try {
  execSync('bubblewrap --version', { encoding: 'utf8' });
  console.log('✅ Bubblewrap이 설치되어 있습니다.');
} catch (error) {
  console.log('❌ Bubblewrap이 설치되지 않았습니다.');
  console.log('설치 명령어: npm install -g @bubblewrap/cli');
  process.exit(1);
}

// Android Studio 확인
console.log('\n🤖 Android Studio 확인 중...');
try {
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (androidHome && fs.existsSync(androidHome)) {
    console.log(`✅ Android SDK: ${androidHome}`);
  } else {
    console.log('⚠️  Android SDK 경로를 찾을 수 없습니다.');
    console.log('환경 변수 ANDROID_HOME 또는 ANDROID_SDK_ROOT를 설정해주세요.');
  }
} catch (error) {
  console.log('⚠️  Android Studio 설정을 확인할 수 없습니다.');
}

console.log('\n🎉 TWA 설정 준비 완료!');
console.log('\n다음 단계:');
console.log('1. npm run twa:doctor - 환경 검증');
console.log('2. npm run twa:init - TWA 초기화');
console.log('3. npm run twa:build - 앱 빌드');
console.log('4. npm run twa:build:aab - Google Play Store용 AAB 생성');
