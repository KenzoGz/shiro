/* =========================================
   1. KỊCH BẢN: MA THUẬT NO GAME NO LIFE
========================================= */
const symbols = ['♠', '♥', '♦', '♣', '♚', '♛', '♞', '♟', '✦', '✧'];
const colors = ['glow-pink', 'glow-cyan', 'glow-purple'];
const symbolCount = 35; 
const bgContainer = document.getElementById('ngnl-background');

function createSymbol() {
    const symbolEl = document.createElement('div');
    symbolEl.classList.add('ngnl-symbol');
    
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    symbolEl.innerText = randomSymbol;
    symbolEl.classList.add(randomColor);
    
    const leftPos = Math.random() * 100; 
    const size = Math.random() * 25 + 15; 
    const duration = Math.random() * 15 + 10; 
    const delay = Math.random() * 15; 
    
    symbolEl.style.left = `${leftPos}%`;
    symbolEl.style.fontSize = `${size}px`;
    symbolEl.style.animationDuration = `${duration}s`;
    symbolEl.style.animationDelay = `-${delay}s`; 
    
    if (bgContainer) {
        bgContainer.appendChild(symbolEl);
    }
}

if (bgContainer) {
    for (let i = 0; i < symbolCount; i++) {
        createSymbol();
    }
}

/* =========================================
   2. THANH ĐIỀU HƯỚNG TRƯỢT XUỐNG
========================================= */
const stickyNav = document.getElementById('sticky-nav');

window.addEventListener('scroll', () => {
    const screenHeight = window.innerHeight;
    if (window.scrollY > screenHeight * 0.4) {
        stickyNav.style.top = '0';
    } else {
        stickyNav.style.top = '-80px';
    }
});

/* =========================================
   3. CUỘN TRANG MƯỢT NHƯ LỤA (FULLPAGE SCROLL)
========================================= */
const pages = document.querySelectorAll('.snap-page');
let currentPage = 0;
let isScrolling = false;

// Bắt sự kiện lăn con lăn chuột (wheel)
window.addEventListener('wheel', (e) => {
    // Ngăn chặn trình duyệt cuộn theo từng khấc giật giật
    e.preventDefault(); 
    
    // Nếu trang web đang trượt dở, không cho phép lăn tiếp (Chống trôi nhiều trang)
    if (isScrolling) return; 

    if (e.deltaY > 0) {
        // Lăn xuống
        if (currentPage < pages.length - 1) {
            currentPage++;
            scrollToPage(currentPage);
        }
    } else if (e.deltaY < 0) {
        // Lăn lên
        if (currentPage > 0) {
            currentPage--;
            scrollToPage(currentPage);
        }
    }
}, { passive: false }); // Lệnh này bắt buộc phải có để chặn cuộn mặc định của trình duyệt

function scrollToPage(index) {
    isScrolling = true; // Khóa cuộn
    
    // Ra lệnh trượt mượt mà tới trang tiếp theo
    pages[index].scrollIntoView({ behavior: 'smooth' });
    
    // Đợi 800ms cho hiệu ứng trượt kết thúc thì mới mở khóa cuộn
    setTimeout(() => {
        isScrolling = false;
    }, 800);
}