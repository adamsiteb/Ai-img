// المتغيرات العامة
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const imageGrid = document.getElementById('imageGrid');
const loading = document.getElementById('loading');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const downloadBtn = document.getElementById('downloadBtn');
const themeSwitch = document.querySelector('.theme-switch');

// تبديل الثيم
let isDarkTheme = true;
themeSwitch.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeSwitch.innerHTML = isDarkTheme ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// توليد الصور
async function generateImage(prompt) {
    try {
        showLoading();
        
        // تنظيف النص وترميزه
        const cleanPrompt = encodeURIComponent(prompt.trim());
        const imageUrl = `https://gt6sgwi.serv00.net/image/Tom.php?text=${cleanPrompt}`;
        
        // محاولة تحميل الصورة
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('فشل في توليد الصورة');
        
        // إنشاء بطاقة الصورة
        createImageCard(imageUrl, prompt);
        showNotification('تم توليد الصورة بنجاح!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('حدث خطأ أثناء توليد الصورة', 'error');
    } finally {
        hideLoading();
    }
}

// إنشاء بطاقة صورة
function createImageCard(imageUrl, prompt) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = prompt;
    img.loading = 'lazy';
    
    // معالجة النقر على الصورة
    img.addEventListener('click', () => {
        openModal(imageUrl);
    });
    
    card.appendChild(img);
    imageGrid.insertBefore(card, imageGrid.firstChild);
}

// فتح النافذة المنبثقة
function openModal(imageUrl) {
    modal.style.display = 'block';
    modalImage.src = imageUrl;
    downloadBtn.onclick = () => downloadImage(imageUrl);
}

// إغلاق النافذة المنبثقة
modal.querySelector('.close-modal').onclick = () => {
    modal.style.display = 'none';
};

// تحميل الصورة
async function downloadImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        showNotification('فشل في تحميل الصورة', 'error');
    }
}

// إظهار/إخفاء التحميل
function showLoading() {
    loading.classList.remove('hidden');
    generateBtn.disabled = true;
}

function hideLoading() {
    loading.classList.add('hidden');
    generateBtn.disabled = false;
}

// إظهار الإشعارات
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// معالجة الأحداث
generateBtn.addEventListener('click', () => {
    const prompt = promptInput.value.trim();
    if (prompt) {
        generateImage(prompt);
    } else {
        showNotification('الرجاء إدخال وصف للصورة', 'error');
    }
});

clearBtn.addEventListener('click', () => {
    promptInput.value = '';
});

// معالجة الضغط على Enter
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateBtn.click();
    }
});

// إغلاق النافذة المنبثقة عند النقر خارجها
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};

// حفظ الصور في التخزين المحلي
function saveToLocalStorage(imageUrl, prompt) {
    const images = JSON.parse(localStorage.getItem('generatedImages') || '[]');
    images.unshift({ url: imageUrl, prompt, date: new Date().toISOString() });
    localStorage.setItem('generatedImages', JSON.stringify(images.slice(0, 20))); // حفظ آخر 20 صورة فقط
}

// استعادة الصور المحفوظة
function loadSavedImages() {
    const images = JSON.parse(localStorage.getItem('generatedImages') || '[]');
    images.forEach(img => createImageCard(img.url, img.prompt));
}

// تحميل الصور المحفوظة عند بدء التطبيق
document.addEventListener('DOMContentLoaded', loadSavedImages);