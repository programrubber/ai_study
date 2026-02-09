// 로그인 확인
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// 현재 사용자 표시
const username = sessionStorage.getItem('username');
document.getElementById('currentUser').textContent = `안녕하세요, ${username}님`;
document.getElementById('sidebarUsername').textContent = username;

// 로그아웃 처리
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.clear();
    window.location.href = 'index.html';
});

// 차트 설정
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#2d3548';

// 모의 데이터
const attackTypes = ['DDoS', 'SQL Injection', 'XSS', 'Port Scan', 'Brute Force', 'Malware', 'Phishing', 'MITM', 'Zero Day', 'Ransomware'];
let trafficData = {
    blocked: [],
    allowed: [],
    labels: []
};

let attackStats = {};
attackTypes.forEach(type => {
    attackStats[type] = Math.floor(Math.random() * 1000) + 100;
});

// 트래픽 흐름 차트 (라인)
const trafficFlowCtx = document.getElementById('trafficFlowChart').getContext('2d');
const trafficFlowChart = new Chart(trafficFlowCtx, {
    type: 'line',
    data: {
        labels: trafficData.labels,
        datasets: [
            {
                label: '차단됨',
                data: trafficData.blocked,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: '허용됨',
                data: trafficData.allowed,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#2d3548'
                }
            },
            x: {
                grid: {
                    color: '#2d3548'
                }
            }
        }
    }
});

// 공격 유형 도넛 차트
const attackDonutCtx = document.getElementById('attackDonutChart').getContext('2d');
const attackDonutChart = new Chart(attackDonutCtx, {
    type: 'doughnut',
    data: {
        labels: attackTypes,
        datasets: [{
            data: Object.values(attackStats),
            backgroundColor: [
                '#00d4ff', '#00fff2', '#8b5cf6', '#ef4444', '#f59e0b',
                '#10b981', '#3b82f6', '#ec4899', '#6366f1', '#14b8a6'
            ],
            borderWidth: 2,
            borderColor: '#1e2442'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right'
            }
        }
    }
});

// 공격 빈도 바 차트
const attackBarCtx = document.getElementById('attackBarChart').getContext('2d');
const attackBarChart = new Chart(attackBarCtx, {
    type: 'bar',
    data: {
        labels: attackTypes,
        datasets: [{
            label: '공격 횟수',
            data: Object.values(attackStats),
            backgroundColor: 'rgba(0, 212, 255, 0.7)',
            borderColor: '#00d4ff',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: '#2d3548'
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// 공격 추세 라인 차트
const attackLineCtx = document.getElementById('attackLineChart').getContext('2d');
const attackLineData = {
    labels: [],
    datasets: []
};

// 3개 주요 공격 유형만 표시
const topAttacks = Object.entries(attackStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

const colors = ['#00d4ff', '#00fff2', '#8b5cf6'];
topAttacks.forEach((attack, index) => {
    attackLineData.datasets.push({
        label: attack[0],
        data: [],
        borderColor: colors[index],
        backgroundColor: `${colors[index]}20`,
        tension: 0.4,
        fill: true
    });
});

const attackLineChart = new Chart(attackLineCtx, {
    type: 'line',
    data: attackLineData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#2d3548'
                }
            },
            x: {
                grid: {
                    color: '#2d3548'
                }
            }
        }
    }
});

// 차단/허용 비율 차트
const blockAllowCtx = document.getElementById('blockAllowChart').getContext('2d');
const blockAllowChart = new Chart(blockAllowCtx, {
    type: 'pie',
    data: {
        labels: ['차단됨', '허용됨'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#ef4444', '#00d4ff'],
            borderWidth: 2,
            borderColor: '#1e2442'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        }
    }
});

// 방화벽 규칙 히트 표시
function updateRuleHits() {
    const rules = JSON.parse(localStorage.getItem('firewallRules') || '[]');
    const ruleHitsList = document.getElementById('ruleHitsList');

    if (rules.length === 0) {
        ruleHitsList.innerHTML = '<p class="empty-state">규칙을 생성하면 히트 통계가 표시됩니다</p>';
        document.getElementById('activeRules').textContent = '0';
        return;
    }

    document.getElementById('activeRules').textContent = rules.length;

    ruleHitsList.innerHTML = '';
    rules.forEach((rule, index) => {
        const hits = Math.floor(Math.random() * 1000);
        const action = rule.action?.value || 'UNKNOWN';
        const actionClass = action === 'ACCEPT' ? 'action-allow' : action === 'DROP' ? 'action-block' : 'action-reject';

        const ruleHitItem = document.createElement('div');
        ruleHitItem.className = 'rule-hit-item';
        ruleHitItem.innerHTML = `
            <div class="rule-hit-header">
                <span class="rule-hit-number">#${index + 1}</span>
                <span class="rule-hit-action ${actionClass}">${action}</span>
                <span class="rule-hit-count">${hits} hits</span>
            </div>
            <div class="rule-hit-details">
                ${rule['source-ip'] ? `<span>📍 ${rule['source-ip'].value}</span>` : ''}
                ${rule['dest-ip'] ? `<span>🎯 ${rule['dest-ip'].value}</span>` : ''}
                ${rule['protocol'] ? `<span>📡 ${rule['protocol'].value.toUpperCase()}</span>` : ''}
            </div>
            <div class="rule-hit-progress">
                <div class="progress-bar-small">
                    <div class="progress-fill-small" style="width: ${(hits / 1000) * 100}%"></div>
                </div>
            </div>
        `;
        ruleHitsList.appendChild(ruleHitItem);
    });
}

// 실시간 데이터 업데이트
function updateRealTimeData() {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();

    // 트래픽 흐름 데이터 추가
    const blockedValue = Math.floor(Math.random() * 100) + 20;
    const allowedValue = Math.floor(Math.random() * 200) + 50;

    trafficData.labels.push(timeLabel);
    trafficData.blocked.push(blockedValue);
    trafficData.allowed.push(allowedValue);

    // 최대 20개 데이터 포인트만 유지
    if (trafficData.labels.length > 20) {
        trafficData.labels.shift();
        trafficData.blocked.shift();
        trafficData.allowed.shift();
    }

    trafficFlowChart.update();

    // 공격 추세 데이터 업데이트
    if (attackLineData.labels.length === 0 || attackLineData.labels.length >= 15) {
        attackLineData.labels = [];
        attackLineData.datasets.forEach(dataset => {
            dataset.data = [];
        });
    }

    attackLineData.labels.push(timeLabel);
    attackLineData.datasets.forEach((dataset, index) => {
        dataset.data.push(Math.floor(Math.random() * 50) + 10);
    });

    attackLineChart.update();

    // 공격 통계 업데이트
    attackTypes.forEach(type => {
        attackStats[type] += Math.floor(Math.random() * 20);
    });

    attackDonutChart.data.datasets[0].data = Object.values(attackStats);
    attackDonutChart.update();

    attackBarChart.data.datasets[0].data = Object.values(attackStats);
    attackBarChart.update();

    // 차단/허용 비율 업데이트
    const totalBlocked = trafficData.blocked.reduce((a, b) => a + b, 0);
    const totalAllowed = trafficData.allowed.reduce((a, b) => a + b, 0);

    blockAllowChart.data.datasets[0].data = [totalBlocked, totalAllowed];
    blockAllowChart.update();

    // 통계 카드 업데이트
    document.getElementById('blockedAttacks').textContent = totalBlocked.toLocaleString();
    document.getElementById('allowedRequests').textContent = totalAllowed.toLocaleString();

    // 위협 레벨 계산
    const threatRatio = totalBlocked / (totalBlocked + totalAllowed);
    const threatLevelEl = document.getElementById('threatLevel');

    if (threatRatio > 0.4) {
        threatLevelEl.textContent = '높음';
        threatLevelEl.style.color = '#ef4444';
    } else if (threatRatio > 0.2) {
        threatLevelEl.textContent = '중간';
        threatLevelEl.style.color = '#f59e0b';
    } else {
        threatLevelEl.textContent = '낮음';
        threatLevelEl.style.color = '#10b981';
    }
}

// 위젯 드래그 앤 드롭
let draggedWidget = null;

document.querySelectorAll('.widget').forEach(widget => {
    widget.addEventListener('dragstart', function(e) {
        draggedWidget = this;
        setTimeout(() => {
            this.style.opacity = '0.5';
        }, 0);
    });

    widget.addEventListener('dragend', function() {
        setTimeout(() => {
            draggedWidget.style.opacity = '1';
            draggedWidget = null;
        }, 0);
    });

    widget.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    widget.addEventListener('drop', function(e) {
        e.preventDefault();
        if (draggedWidget !== this) {
            const allWidgets = [...document.querySelectorAll('.widget')];
            const draggedIndex = allWidgets.indexOf(draggedWidget);
            const targetIndex = allWidgets.indexOf(this);

            const grid = document.getElementById('widgetsGrid');

            if (draggedIndex < targetIndex) {
                grid.insertBefore(draggedWidget, this.nextSibling);
            } else {
                grid.insertBefore(draggedWidget, this);
            }

            // 위젯 순서를 로컬 스토리지에 저장
            saveWidgetOrder();
        }
    });
});

// 위젯 순서 저장
function saveWidgetOrder() {
    const widgets = [...document.querySelectorAll('.widget')];
    const order = widgets.map(w => w.getAttribute('data-widget-id'));
    localStorage.setItem('widgetOrder', JSON.stringify(order));
}

// 위젯 순서 불러오기
function loadWidgetOrder() {
    const savedOrder = JSON.parse(localStorage.getItem('widgetOrder') || '[]');
    if (savedOrder.length === 0) return;

    const grid = document.getElementById('widgetsGrid');
    const widgets = {};

    // 현재 위젯들을 ID로 매핑
    document.querySelectorAll('.widget').forEach(widget => {
        const id = widget.getAttribute('data-widget-id');
        widgets[id] = widget;
        widget.remove();
    });

    // 저장된 순서대로 다시 추가
    savedOrder.forEach(id => {
        if (widgets[id]) {
            grid.appendChild(widgets[id]);
        }
    });
}

// 초기화
updateRuleHits();
loadWidgetOrder();

// 3초마다 실시간 데이터 업데이트
setInterval(updateRealTimeData, 3000);

// 5초마다 규칙 히트 업데이트
setInterval(updateRuleHits, 5000);

// 초기 데이터 생성
for (let i = 0; i < 10; i++) {
    updateRealTimeData();
}
