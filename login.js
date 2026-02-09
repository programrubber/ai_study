// 하드코딩된 사용자 데이터
const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' }
];

// 로그인 폼 처리
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // 사용자 인증 확인
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // 로그인 성공
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        window.location.href = 'dashboard.html';
    } else {
        // 로그인 실패
        errorMessage.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';

        // 3초 후 에러 메시지 제거
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }
});

// 엔터 키 처리
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('password').focus();
    }
});
