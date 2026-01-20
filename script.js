// DOM 요소
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// 전역 변수
let todos = [];
let currentFilter = 'all';

// 로컬 스토리지에서 데이터 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
        updateStats();
    }
}

// 로컬 스토리지에 데이터 저장하기
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Todo 추가
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(newTodo); // 배열 맨 앞에 추가
    todoInput.value = '';
    
    saveTodos();
    renderTodos();
    updateStats();
    
    // 입력 필드에 포커스
    todoInput.focus();
}

// Todo 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

// Todo 완료 토글
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// 완료된 Todo 모두 삭제
function clearCompleted() {
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
        alert('완료된 항목이 없습니다.');
        return;
    }
    
    if (confirm(`완료된 ${completedTodos.length}개의 항목을 삭제하시겠습니까?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// 필터링된 Todo 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Todo 렌더링
function renderTodos() {
    todoList.innerHTML = '';
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        let message = '';
        switch (currentFilter) {
            case 'active':
                message = '<p>진행중인 할 일이 없습니다!</p><small>새로운 할 일을 추가해보세요.</small>';
                break;
            case 'completed':
                message = '<p>완료된 할 일이 없습니다!</p><small>할 일을 완료해보세요.</small>';
                break;
            default:
                message = '<p>할 일이 없습니다!</p><small>위에서 새로운 할 일을 추가해보세요.</small>';
        }
        
        emptyState.innerHTML = message;
        todoList.appendChild(emptyState);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="checkbox" data-id="${todo.id}"></div>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" data-id="${todo.id}">삭제</button>
        `;
        
        todoList.appendChild(li);
    });
    
    // 이벤트 리스너 추가
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            toggleTodo(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteTodo(id);
        });
    });
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;
    
    totalCount.textContent = `전체: ${total}`;
    activeCount.textContent = `진행중: ${active}`;
    completedCount.textContent = `완료: ${completed}`;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 필터 변경
function setFilter(filter) {
    currentFilter = filter;
    
    // 필터 버튼 활성화 상태 변경
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        setFilter(e.target.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// 초기 로드
loadTodos();
