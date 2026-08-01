// ============ GESTIONE DATI ============
let appData = {
    categories: {
        drink: { name: 'Drink', icon: '🍺', count: 0, history: [] },
        coffee: { name: 'Caffè', icon: '☕', count: 0, history: [] },
        water: { name: 'Acqua', icon: '💧', count: 0, history: [] },
        pizza: { name: 'Pizza', icon: '🍕', count: 0, history: [] },
        shots: { name: 'Shots', icon: '🥃', count: 0, history: [] },
        beer: { name: 'Birre', icon: '🍻', count: 0, history: [] }
    },
    currentCategory: 'drink',
    friends: [],
    photos: [],
    streak: 0,
    lastActiveDate: null
};

// Carica dati salvati
function loadData() {
    const saved = localStorage.getItem('countitData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appData = { ...appData, ...parsed };
        } catch(e) {
            console.log('Errore caricamento dati');
        }
    }
}

// Salva dati
function saveData() {
    localStorage.setItem('countitData', JSON.stringify(appData));
}

// ============ GESTIONE STREAK ============
function checkStreak() {
    const today = new Date().toDateString();
    if (appData.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (appData.lastActiveDate === yesterday) {
            appData.streak += 1;
        } else {
            appData.streak = 1;
        }
        appData.lastActiveDate = today;
        saveData();
    }
}

// ============ CONFETTI ============
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#FF6B35', '#ff8c42', '#FFD700', '#FF69B4', '#00CED1', '#98FB98'];
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        piece.style.animationDuration = (Math.random() * 1 + 2) + 's';
        container.appendChild(piece);
        
        setTimeout(() => piece.remove(), 3000);
    }
}

// ============ AGGIORNA UI ============
function updateUI() {
    const currentCat = appData.categories[appData.currentCategory];
    
    // Aggiorna totale
    let total = 0;
    Object.values(appData.categories).forEach(cat => total += cat.count);
    document.getElementById('totalCount').textContent = total;
    
    // Streak
    document.getElementById('streak').textContent = appData.streak;
    
    // Rank
    const friendsSorted = [...appData.friends].sort((a, b) => b.count - a.count);
    const myRank = friendsSorted.findIndex(f => f.isMe) + 1;
    document.getElementById('rank').textContent = myRank > 0 ? '#' + myRank : '-';
    
    // Contatore categoria corrente
    document.getElementById('counterValue').textContent = currentCat.count;
    document.getElementById('currentCategoryName').textContent = currentCat.icon + ' ' + currentCat.name;
    
    // Aggiorna classifica
    updateLeaderboard();
    
    // Aggiorna cronologia
    updateHistory();
    
    // Aggiorna foto
    updatePhotos();
}

function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const friendsSorted = [...appData.friends].sort((a, b) => b.count - a.count);
    
    if (friendsSorted.length === 0) {
        leaderboard.innerHTML = '<p class="empty-msg">Nessun amico in classifica</p>';
        return;
    }
    
    leaderboard.innerHTML = friendsSorted.map((friend, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const rank = index < 3 ? medals[index] : `#${index + 1}`;
        return `
            <div class="friend-item">
                <span class="friend-rank">${rank}</span>
                <span class="friend-name">${friend.name} ${friend.isMe ? '👈' : ''}</span>
                <span class="friend-count">${friend.count}</span>
                <div class="friend-btns">
                    <button class="friend-btn minus" onclick="updateFriendCount('${friend.id}', -1)">−</button>
                    <button class="friend-btn plus" onclick="updateFriendCount('${friend.id}', 1)">+</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateHistory() {
    const historyList = document.getElementById('historyList');
    const currentCat = appData.categories[appData.currentCategory];
    const history = currentCat.history.slice(-10).reverse();
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">Nessuna attività</p>';
        return;
    }
    
    historyList.innerHTML = history.map(entry => `
        <div class="history-item">
            <span class="history-amount">+${entry.amount} ${currentCat.icon}</span>
            <span class="history-time">${new Date(entry.timestamp).toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
    `).join('');
}

function updatePhotos() {
    const photoGrid = document.getElementById('photoGrid');
    const photos = appData.photos.slice(0, 9);
    
    photoGrid.innerHTML = photos.map(photo => `
        <div style="position:relative; aspect-ratio:1;">
            <img src="${photo.data}" class="photo-item" alt="Foto drink">
            <div class="photo-info">${photo.categoryIcon} ${photo.count}</div>
        </div>
    `).join('');
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    checkStreak();
    updateUI();
    saveData();
    
    // Vibrazione al tap (solo su dispositivi supportati)
    if (navigator.vibrate) {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                navigator.vibrate(10);
            }
        });
    }
});

// Cambio categoria
document.getElementById('categoryList').addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-btn')) {
        document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        appData.currentCategory = e.target.dataset.cat;
        saveData();
        updateUI();
    }
});

// Incremento/Decremento
document.getElementById('incrementBtn').addEventListener('click', () => {
    incrementCount(1);
});

document.getElementById('decrementBtn').addEventListener('click', () => {
    decrementCount(1);
});

// Quick buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const amount = parseInt(e.target.dataset.amount);
        incrementCount(amount);
    });
});

function incrementCount(amount) {
    const cat = appData.currentCategory;
    appData.categories[cat].count += amount;
    appData.categories[cat].history.push({
        amount: amount,
        timestamp: new Date().toISOString()
    });
    
    // Milestone: confetti ogni 10
    if (appData.categories[cat].count % 10 === 0) {
        createConfetti();
    }
    
    saveData();
    updateUI();
}

function decrementCount(amount) {
    const cat = appData.currentCategory;
    appData.categories[cat].count = Math.max(0, appData.categories[cat].count - amount);
    saveData();
    updateUI();
}

// Foto
document.getElementById('takePhotoBtn').addEventListener('click', () => {
    document.getElementById('photoInput').click();
});

document.getElementById('photoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const currentCat = appData.categories[appData.currentCategory];
            appData.photos.unshift({
                id: Date.now().toString(),
                data: event.target.result,
                timestamp: new Date().toISOString(),
                category: appData.currentCategory,
                categoryIcon: currentCat.icon,
                count: currentCat.count
            });
            saveData();
            updateUI();
        };
        reader.readAsDataURL(file);
    }
});

// Amici
document.getElementById('addFriendBtn').addEventListener('click', addFriend);
document.getElementById('friendName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addFriend();
});

function addFriend() {
    const input = document.getElementById('friendName');
    const name = input.value.trim();
    
    if (name) {
        appData.friends.push({
            id: Date.now().toString(),
            name: name,
            count: 0,
            isMe: false
        });
        input.value = '';
        saveData();
        updateUI();
    }
}

function updateFriendCount(id, change) {
    const friend = appData.friends.find(f => f.id === id);
    if (friend) {
        friend.count = Math.max(0, friend.count + change);
        saveData();
        updateUI();
    }
}

// Aggiungi "Io" alla classifica se non presente
function addMeToLeaderboard() {
    const meExists = appData.friends.some(f => f.isMe);
    if (!meExists) {
        const currentCat = appData.categories[appData.currentCategory];
        appData.friends.push({
            id: 'me',
            name: 'Io',
            count: currentCat.count,
            isMe: true
        });
        saveData();
        updateUI();
    } else {
        // Aggiorna il mio conteggio
        const me = appData.friends.find(f => f.isMe);
        if (me) {
            const currentCat = appData.categories[appData.currentCategory];
            me.count = currentCat.count;
            saveData();
            updateUI();
        }
    }
}

// Aggiorna "Io" quando cambio categoria
document.getElementById('categoryList').addEventListener('click', () => {
    setTimeout(addMeToLeaderboard, 100);
});

// Inizializza
addMeToLeaderboard();
