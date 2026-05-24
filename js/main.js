/* =========================================
   1. BACKGROUND EFFECT 
========================================= */
const symbols = ['♠', '♥', '♦', '♣', '♚', '♛', '♞', '♟', '✦', '✧'];
const colors = ['glow-pink', 'glow-cyan', 'glow-purple'];
const bgContainer = document.getElementById('ngnl-background');

function createSymbol() {
    const symbolEl = document.createElement('div');
    symbolEl.classList.add('ngnl-symbol');
    symbolEl.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    symbolEl.classList.add(colors[Math.floor(Math.random() * colors.length)]);
    symbolEl.style.left = `${Math.random() * 100}%`;
    symbolEl.style.fontSize = `${Math.random() * 25 + 15}px`;
    symbolEl.style.animationDuration = `${Math.random() * 15 + 10}s`;
    symbolEl.style.animationDelay = `-${Math.random() * 15}s`; 
    if (bgContainer) bgContainer.appendChild(symbolEl);
}
if (bgContainer) { for (let i = 0; i < 35; i++) createSymbol(); }

/* =========================================
   2. SNAP SCROLL
========================================= */
const pages = document.querySelectorAll('.snap-page');
let currentPage = 0;
let isScrolling = false;

window.addEventListener('wheel', (e) => {
    if (window.innerWidth > 900) {
        e.preventDefault(); 
        if (isScrolling) return; 
        
        if (e.deltaY > 0 && currentPage < pages.length - 1) { 
            currentPage++; 
            scrollToPage(currentPage); 
        }
        else if (e.deltaY < 0 && currentPage > 0) { 
            currentPage--; 
            scrollToPage(currentPage); 
        }
    }
}, { passive: false });

function scrollToPage(index) {
    isScrolling = true; 
    pages[index].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { isScrolling = false; }, 800); 
}

function scrollToNext() {
    if (currentPage < pages.length - 1) {
        currentPage++;
        scrollToPage(currentPage);
    }
}

/* =========================================
   3. CLOCK
========================================= */
function updateClock() {
    const now = new Date();
    document.getElementById('clock-hour').innerText = String(now.getHours()).padStart(2, '0');
    document.getElementById('clock-minute').innerText = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock-sec').innerText = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock-date').innerText = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
    });
}
setInterval(updateClock, 1000);
updateClock();

/* =========================================
   4. API DISCORD 
========================================= */
const DISCORD_USER_ID = "366492309375811597"; 

function fetchDiscordStatus() {
    if (DISCORD_USER_ID === "ID") {
        document.getElementById('discord-username').innerText = "ID not found!";
        document.getElementById('discord-tag').innerText = "Please change ID in script!";
        return;
    }

    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
        .then(response => response.json())
        .then(res => {
            if (!res.success) {
                document.getElementById('discord-tag').innerText = "Connection failed";
                return;
            }
            const data = res.data;
            const user = data.discord_user;

            document.getElementById('discord-username').innerText = user.global_name || user.username;
            document.getElementById('discord-tag').innerText = (user.discriminator && user.discriminator !== "0") ? `${user.username}#${user.discriminator}` : `@${user.username}`; 
            
            if (user.avatar) document.getElementById('discord-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            document.getElementById('discord-status-dot').className = `status-dot ${data.discord_status}`;

            const activityEl = document.getElementById('discord-activity');
            if (data.listening_to_spotify && data.spotify) {
                activityEl.innerHTML = `<i class="fab fa-spotify" style="color: #1DB954;"></i> Nghe: ${data.spotify.track}`;
            } else {
                const gameActivity = data.activities.find(act => act.type === 0);
                if (gameActivity) activityEl.innerHTML = `<i class="fas fa-gamepad"></i> Now playing: ${gameActivity.name}`;
                else {
                    const customActivity = data.activities.find(act => act.type === 4);
                    activityEl.innerHTML = customActivity ? customActivity.state : "";
                }
            }
        })
        .catch(err => {
            console.error("Error", err);
            document.getElementById('discord-tag').innerText = "Did not join the server";
        });
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 15000);

/* =========================================
   5. RANDOM GIF   
========================================= */
const gifList = [
    'assets/images/shiro1.gif',
    'assets/images/shiro2.gif',
    'assets/images/shiro3.gif',
    'assets/images/shiro4.gif',
    'assets/images/shiro5.gif'
];

const gifElement = document.getElementById('random-gif');
if (gifElement) {
    const randomImage = gifList[Math.floor(Math.random() * gifList.length)];
    gifElement.src = randomImage;
}