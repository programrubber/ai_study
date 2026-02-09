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

// 방화벽 규칙 저장소
let currentRule = {};
let savedRules = [];
let draggedElement = null;

// 로컬 스토리지에서 규칙 불러오기
function loadRulesFromStorage() {
    const stored = localStorage.getItem('firewallRules');
    if (stored) {
        savedRules = JSON.parse(stored);
        renderRulesList();
        updatePreview();
        updateStats();
    }
}

// 로컬 스토리지에 규칙 저장
function saveRulesToStorage() {
    localStorage.setItem('firewallRules', JSON.stringify(savedRules));
}

// 드래그 시작
document.querySelectorAll('.draggable-block').forEach(block => {
    block.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'copy';
    });

    block.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
    });
});

// 드롭존 처리
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    if (draggedElement) {
        const blockType = draggedElement.getAttribute('data-type');
        const blockLabel = draggedElement.querySelector('.block-label').textContent;
        const blockIcon = draggedElement.querySelector('.block-icon').textContent;

        // 입력 모달 표시
        showInputModal(blockType, blockLabel, blockIcon);
    }
});

// 입력 모달 표시
function showInputModal(type, label, icon) {
    const modal = document.getElementById('inputModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `${label} 설정`;

    let inputHTML = '';

    switch(type) {
        case 'source-ip':
        case 'dest-ip':
            inputHTML = `
                <label>IP 주소 또는 CIDR:</label>
                <input type="text" id="modalInput" placeholder="예: 192.168.1.0/24" class="modal-input">
            `;
            break;
        case 'source-port':
        case 'dest-port':
            inputHTML = `
                <label>포트 번호:</label>
                <input type="text" id="modalInput" placeholder="예: 80 또는 8000-9000" class="modal-input">
            `;
            break;
        case 'protocol':
            inputHTML = `
                <label>프로토콜:</label>
                <select id="modalInput" class="modal-select">
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP</option>
                    <option value="all">ALL</option>
                </select>
            `;
            break;
        case 'action':
            inputHTML = `
                <label>액션:</label>
                <select id="modalInput" class="modal-select">
                    <option value="ACCEPT">ACCEPT (허용)</option>
                    <option value="DROP">DROP (차단)</option>
                    <option value="REJECT">REJECT (거부)</option>
                </select>
            `;
            break;
    }

    modalBody.innerHTML = inputHTML;
    modal.style.display = 'flex';

    // 모달 확인 버튼
    document.getElementById('modalConfirm').onclick = () => {
        const value = document.getElementById('modalInput').value;
        if (value) {
            addBlockToRule(type, label, icon, value);
            modal.style.display = 'none';
        }
    };

    // 모달 취소 버튼
    document.getElementById('modalCancel').onclick = () => {
        modal.style.display = 'none';
    };
}

// 규칙에 블록 추가
function addBlockToRule(type, label, icon, value) {
    const dropHint = dropZone.querySelector('.drop-hint');
    if (dropHint) {
        dropHint.remove();
    }

    // 현재 규칙에 추가
    currentRule[type] = { label, value, icon };

    // 블록 요소 생성
    const blockElement = document.createElement('div');
    blockElement.className = 'placed-block';
    blockElement.innerHTML = `
        <span class="block-icon">${icon}</span>
        <div class="block-content">
            <div class="block-label">${label}</div>
            <div class="block-value">${value}</div>
        </div>
        <button class="block-remove" onclick="removeBlock('${type}')">&times;</button>
    `;

    dropZone.appendChild(blockElement);
    updatePreview();
}

// 블록 제거
function removeBlock(type) {
    delete currentRule[type];
    renderCurrentRule();
    updatePreview();
}

// 현재 규칙 렌더링
function renderCurrentRule() {
    dropZone.innerHTML = '';

    if (Object.keys(currentRule).length === 0) {
        dropZone.innerHTML = '<p class="drop-hint">여기에 블록을 드래그하세요</p>';
        return;
    }

    Object.entries(currentRule).forEach(([type, data]) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'placed-block';
        blockElement.innerHTML = `
            <span class="block-icon">${data.icon}</span>
            <div class="block-content">
                <div class="block-label">${data.label}</div>
                <div class="block-value">${data.value}</div>
            </div>
            <button class="block-remove" onclick="removeBlock('${type}')">&times;</button>
        `;
        dropZone.appendChild(blockElement);
    });
}

// 규칙 추가
document.getElementById('addRuleBtn').addEventListener('click', () => {
    if (Object.keys(currentRule).length === 0) {
        alert('규칙에 최소 하나의 블록을 추가해주세요.');
        return;
    }

    // 규칙 저장
    savedRules.push({ ...currentRule, id: Date.now() });

    // 로컬 스토리지에 저장
    saveRulesToStorage();

    // 초기화
    currentRule = {};
    renderCurrentRule();
    renderRulesList();
    updatePreview();
    updateStats();
});

// 규칙 초기화
document.getElementById('clearRuleBtn').addEventListener('click', () => {
    currentRule = {};
    renderCurrentRule();
    updatePreview();
});

// 규칙 목록 렌더링
function renderRulesList() {
    const rulesList = document.getElementById('rulesList');

    if (savedRules.length === 0) {
        rulesList.innerHTML = '<p class="empty-state">아직 생성된 규칙이 없습니다</p>';
        return;
    }

    rulesList.innerHTML = '';

    savedRules.forEach((rule, index) => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-item';
        ruleItem.draggable = true;
        ruleItem.dataset.ruleId = rule.id;
        ruleItem.dataset.ruleIndex = index;

        let ruleContent = '<div class="rule-blocks">';
        Object.entries(rule).forEach(([type, data]) => {
            if (type !== 'id') {
                ruleContent += `
                    <div class="rule-block-mini">
                        <span>${data.icon}</span>
                        <span>${data.value}</span>
                    </div>
                `;
            }
        });
        ruleContent += '</div>';

        ruleItem.innerHTML = `
            <div class="rule-header">
                <div class="rule-drag-handle">⋮⋮</div>
                <span class="rule-number">#${index + 1}</span>
                <button class="btn-delete" onclick="deleteRule(${rule.id})">&times;</button>
            </div>
            ${ruleContent}
        `;

        // 드래그 이벤트 추가
        ruleItem.addEventListener('dragstart', handleRuleDragStart);
        ruleItem.addEventListener('dragover', handleRuleDragOver);
        ruleItem.addEventListener('drop', handleRuleDrop);
        ruleItem.addEventListener('dragend', handleRuleDragEnd);
        ruleItem.addEventListener('dragenter', handleRuleDragEnter);
        ruleItem.addEventListener('dragleave', handleRuleDragLeave);

        rulesList.appendChild(ruleItem);
    });
}

// 드래그 중인 규칙
let draggedRuleElement = null;
let draggedRuleIndex = null;

// 규칙 드래그 시작
function handleRuleDragStart(e) {
    draggedRuleElement = e.currentTarget;
    draggedRuleIndex = parseInt(e.currentTarget.dataset.ruleIndex);
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
}

// 규칙 드래그 오버
function handleRuleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

// 규칙 드래그 진입
function handleRuleDragEnter(e) {
    if (e.currentTarget !== draggedRuleElement) {
        e.currentTarget.classList.add('drag-over-rule');
    }
}

// 규칙 드래그 이탈
function handleRuleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over-rule');
}

// 규칙 드롭
function handleRuleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dropTargetIndex = parseInt(e.currentTarget.dataset.ruleIndex);

    if (draggedRuleIndex !== dropTargetIndex) {
        // 배열 순서 변경
        const draggedRule = savedRules[draggedRuleIndex];
        savedRules.splice(draggedRuleIndex, 1);
        savedRules.splice(dropTargetIndex, 0, draggedRule);

        // 로컬 스토리지에 저장
        saveRulesToStorage();

        // 화면 업데이트
        renderRulesList();
        updatePreview();
    }

    e.currentTarget.classList.remove('drag-over-rule');
    return false;
}

// 규칙 드래그 종료
function handleRuleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.rule-item').forEach(item => {
        item.classList.remove('drag-over-rule');
    });
}

// 규칙 삭제
function deleteRule(id) {
    savedRules = savedRules.filter(rule => rule.id !== id);
    saveRulesToStorage();
    renderRulesList();
    updatePreview();
    updateStats();
}

// 미리보기 업데이트
function updatePreview() {
    const preview = document.getElementById('exportPreview');
    const activeFormat = document.querySelector('.tab-btn.active').getAttribute('data-format');

    if (savedRules.length === 0) {
        preview.textContent = '규칙을 추가하면 여기에 표시됩니다';
        return;
    }

    if (activeFormat === 'json') {
        preview.textContent = JSON.stringify(convertToJSON(), null, 2);
    } else {
        preview.textContent = convertToIptables();
    }
}

// JSON 변환
function convertToJSON() {
    return savedRules.map((rule, index) => {
        const jsonRule = { rule_id: index + 1 };

        if (rule['source-ip']) jsonRule.source_ip = rule['source-ip'].value;
        if (rule['source-port']) jsonRule.source_port = rule['source-port'].value;
        if (rule['dest-ip']) jsonRule.destination_ip = rule['dest-ip'].value;
        if (rule['dest-port']) jsonRule.destination_port = rule['dest-port'].value;
        if (rule['protocol']) jsonRule.protocol = rule['protocol'].value;
        if (rule['action']) jsonRule.action = rule['action'].value;

        return jsonRule;
    });
}

// iptables 변환
function convertToIptables() {
    return savedRules.map((rule, index) => {
        let cmd = 'iptables -A INPUT';

        if (rule['protocol']) {
            cmd += ` -p ${rule['protocol'].value}`;
        }

        if (rule['source-ip']) {
            cmd += ` -s ${rule['source-ip'].value}`;
        }

        if (rule['source-port']) {
            cmd += ` --sport ${rule['source-port'].value}`;
        }

        if (rule['dest-ip']) {
            cmd += ` -d ${rule['dest-ip'].value}`;
        }

        if (rule['dest-port']) {
            cmd += ` --dport ${rule['dest-port'].value}`;
        }

        if (rule['action']) {
            cmd += ` -j ${rule['action'].value}`;
        }

        return `# Rule ${index + 1}\n${cmd}`;
    }).join('\n\n');
}

// 통계 업데이트
function updateStats() {
    document.getElementById('totalRules').textContent = savedRules.length;

    const acceptCount = savedRules.filter(rule => rule['action']?.value === 'ACCEPT').length;
    const dropCount = savedRules.filter(rule => rule['action']?.value === 'DROP').length;

    document.getElementById('acceptRules').textContent = acceptCount;
    document.getElementById('dropRules').textContent = dropCount;
}

// 탭 전환
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        updatePreview();
    });
});

// JSON 내보내기
document.getElementById('exportJsonBtn').addEventListener('click', () => {
    if (savedRules.length === 0) {
        alert('내보낼 규칙이 없습니다.');
        return;
    }

    const jsonData = JSON.stringify(convertToJSON(), null, 2);
    downloadFile('firewall-rules.json', jsonData, 'application/json');
});

// iptables 내보내기
document.getElementById('exportIptablesBtn').addEventListener('click', () => {
    if (savedRules.length === 0) {
        alert('내보낼 규칙이 없습니다.');
        return;
    }

    const iptablesData = convertToIptables();
    downloadFile('firewall-rules.sh', iptablesData, 'text/plain');
});

// 파일 다운로드
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 초기화
loadRulesFromStorage();
updateStats();
