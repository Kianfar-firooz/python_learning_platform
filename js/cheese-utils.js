// ============================================
// 🧀 ابزارهای کامل آکادمی چیزکد
// ============================================

(function() {
    'use strict';

    // ============================================
    // ۱. کش کردن درس‌ها (فقط برای دانلود شده‌ها)
    // ============================================

    function saveToCache(file, content) {
        try {
            var cache = JSON.parse(localStorage.getItem('cheese_cache')) || {};
            cache[file] = content;
            localStorage.setItem('cheese_cache', JSON.stringify(cache));
        } catch(e) {
            console.log('Cache error:', e);
        }
    }

    function getFromCache(file) {
        try {
            var cache = JSON.parse(localStorage.getItem('cheese_cache')) || {};
            return cache[file] || null;
        } catch(e) {
            return null;
        }
    }

    function getAllCache() {
        try {
            return JSON.parse(localStorage.getItem('cheese_cache')) || {};
        } catch(e) {
            return {};
        }
    }

    function clearCache() {
        localStorage.removeItem('cheese_cache');
    }

    function isInCache(file) {
        var cache = getAllCache();
        return cache.hasOwnProperty(file);
    }

    // ============================================
    // ۲. آخرین درس
    // ============================================

    function saveLastLesson(file, title) {
        try {
            localStorage.setItem('cheese_last', JSON.stringify({
                file: file,
                title: title
            }));
        } catch(e) {}
    }

    function getLastLesson() {
        try {
            return JSON.parse(localStorage.getItem('cheese_last'));
        } catch(e) {
            return null;
        }
    }

    function clearLastLesson() {
        localStorage.removeItem('cheese_last');
    }

    // ============================================
    // ۳. پیشرفت
    // ============================================

    function updateProgress(total) {
        var bar = document.getElementById('progressBar');
        var text = document.getElementById('progressText');
        if (!bar) return;

        try {
            var cache = JSON.parse(localStorage.getItem('cheese_cache')) || {};
            var count = Object.keys(cache).length;
            var percent = Math.min(100, Math.round((count / total) * 100));
            
            bar.style.width = percent + '%';
            if (text) {
                text.textContent = count + ' / ' + total + ' درس (' + percent + '%)';
            }
        } catch(e) {}
    }

    function resetProgress() {
        try {
            localStorage.removeItem('cheese_cache');
            return true;
        } catch(e) {
            return false;
        }
    }

    function resetAll() {
        try {
            localStorage.removeItem('cheese_cache');
            localStorage.removeItem('cheese_last');
            localStorage.removeItem('cheese_theme');
            localStorage.removeItem('cheese_version');
            return true;
        } catch(e) {
            return false;
        }
    }

    // ============================================
    // ۴. جستجو
    // ============================================

    function setupSearch() {
        var input = document.getElementById('searchInput');
        var list = document.getElementById('lessons-menu') || document.getElementById('answers-menu');
        if (!input || !list) return;

        var newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        input = newInput;

        input.addEventListener('input', function() {
            var query = this.value.trim().toLowerCase();
            var items = list.querySelectorAll('.menu-item');
            var found = false;

            items.forEach(function(item) {
                var text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'flex';
                    found = true;
                } else {
                    item.style.display = 'none';
                }
            });

            var oldMsg = list.querySelector('.no-result');
            if (oldMsg) oldMsg.remove();

            if (!found && query.length > 0) {
                var msg = document.createElement('div');
                msg.className = 'no-result';
                msg.textContent = '🧀 نتیجه‌ای یافت نشد';
                list.appendChild(msg);
            }
        });
    }

    // ============================================
    // ۵. دکمه‌ی ادامه
    // ============================================

    function setupResume() {
        var btn = document.getElementById('resumeBtn');
        if (!btn) return;

        var last = getLastLesson();
        if (last) {
            btn.style.display = 'block';
            btn.textContent = '▶️ ادامه: ' + last.title;
            btn.onclick = function() {
                var items = document.querySelectorAll('.menu-item');
                for (var i = 0; i < items.length; i++) {
                    if (items[i].textContent.includes(last.title)) {
                        items[i].click();
                        break;
                    }
                }
            };
        } else {
            btn.style.display = 'none';
        }
    }

    // ============================================
    // ۶. تغییر تم
    // ============================================

    function toggleTheme() {
        var body = document.body;
        var current = body.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', next);
        localStorage.setItem('cheese_theme', next);
        
        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = next === 'dark' ? '☀️' : '🌙';
        }
    }

    function loadTheme() {
        var saved = localStorage.getItem('cheese_theme') || 'dark';
        document.body.setAttribute('data-theme', saved);
        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = saved === 'dark' ? '☀️' : '🌙';
        }
    }

    // ============================================
    // ۷. چک کردن آپدیت
    // ============================================

    var VERSION_KEY = 'cheese_version';

    function getLocalVersion() {
        try {
            return JSON.parse(localStorage.getItem(VERSION_KEY));
        } catch(e) {
            return null;
        }
    }

    function saveLocalVersion(versionData) {
        localStorage.setItem(VERSION_KEY, JSON.stringify(versionData));
    }

    function compareVersionsNumbers(v1, v2) {
        var parts1 = v1.split('.').map(Number);
        var parts2 = v2.split('.').map(Number);
        
        for (var i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            var num1 = parts1[i] || 0;
            var num2 = parts2[i] || 0;
            if (num1 !== num2) {
                return num1 > num2 ? 1 : -1;
            }
        }
        return 0;
    }

    function checkForUpdates() {
        return new Promise(function(resolve, reject) {
            fetch('version.json?v=' + Date.now())
                .then(function(res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function(remoteVersion) {
                    var localVersion = getLocalVersion();
                    
                    if (!localVersion) {
                        resolve({
                            hasUpdate: true,
                            remote: remoteVersion,
                            local: null,
                            isFirstTime: true
                        });
                        return;
                    }

                    var remoteMain = remoteVersion.version || '0.0.0';
                    var localMain = localVersion.version || '0.0.0';
                    
                    var hasUpdate = compareVersionsNumbers(remoteMain, localMain) > 0;

                    resolve({
                        hasUpdate: hasUpdate,
                        remote: remoteVersion,
                        local: localVersion,
                        isFirstTime: false
                    });
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    // ============================================
    // ۸. دانلود آفلاین
    // ============================================

    function downloadFile(path) {
        return new Promise(function(resolve, reject) {
            fetch(path + '?v=' + Date.now())
                .then(function(res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.text();
                })
                .then(function(content) {
                    var cacheKey = path;
                    if (path.startsWith('answers/')) {
                        cacheKey = 'answers_' + path.replace('answers/', '');
                    }
                    saveToCache(cacheKey, content);
                    resolve(content);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    function downloadCourse(courseType, onProgress) {
        return new Promise(function(resolve, reject) {
            fetch('version.json?v=' + Date.now())
                .then(function(res) { return res.json(); })
                .then(function(versionData) {
                    var lessons = [];
                    var basePath = '';
                    var prefix = '';

                    if (courseType === 'linux') {
                        lessons = versionData.courses.linux.lessons || [];
                        basePath = 'linux-lessons/';
                        prefix = '';
                    } else if (courseType === 'python') {
                        lessons = versionData.courses.python.lessons || [];
                        basePath = 'python-lessons/';
                        prefix = '';
                    } else if (courseType === 'answers') {
                        lessons = versionData.courses.answers.lessons || [];
                        basePath = 'answers/';
                        prefix = 'answers_';
                    } else {
                        reject(new Error('دوره‌ی نامعتبر'));
                        return;
                    }

                    var total = lessons.length;
                    var completed = 0;
                    var errors = [];

                    if (total === 0) {
                        resolve({ total: 0, completed: 0, errors: [] });
                        return;
                    }

                    var promises = lessons.map(function(lesson) {
                        var fullPath = basePath + lesson.name;
                        var cacheKey = prefix + lesson.name;

                        return fetch(fullPath + '?v=' + Date.now())
                            .then(function(res) {
                                if (!res.ok) throw new Error('HTTP ' + res.status);
                                return res.text();
                            })
                            .then(function(content) {
                                saveToCache(cacheKey, content);
                                completed++;
                                if (onProgress) onProgress(completed, total, lesson.name);
                            })
                            .catch(function(err) {
                                errors.push({ name: lesson.name, error: err.message });
                                completed++;
                                if (onProgress) onProgress(completed, total, lesson.name);
                            });
                    });

                    Promise.all(promises)
                        .then(function() {
                            resolve({ total: total, completed: completed, errors: errors });
                        });
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    // ============================================
    // ۹. API عمومی
    // ============================================

    window.CheeseUtils = {
        saveToCache: saveToCache,
        getFromCache: getFromCache,
        getAllCache: getAllCache,
        clearCache: clearCache,
        isInCache: isInCache,
        
        saveLastLesson: saveLastLesson,
        getLastLesson: getLastLesson,
        clearLastLesson: clearLastLesson,
        
        updateProgress: updateProgress,
        resetProgress: resetProgress,
        resetAll: resetAll,
        
        setupSearch: setupSearch,
        setupResume: setupResume,
        
        toggleTheme: toggleTheme,
        loadTheme: loadTheme,
        
        checkForUpdates: checkForUpdates,
        getLocalVersion: getLocalVersion,
        saveLocalVersion: saveLocalVersion,
        compareVersionsNumbers: compareVersionsNumbers,
        
        downloadFile: downloadFile,
        downloadCourse: downloadCourse
    };

    // ============================================
    // ۱۰. مقداردهی اولیه
    // ============================================

    function init() {
        loadTheme();
        setupSearch();
        setupResume();

        var themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }

        if (navigator.onLine) {
            setTimeout(function() {
                checkForUpdates()
                    .then(function(result) {
                        if (result.hasUpdate) {
                            var count = 0;
                            if (result.remote && result.remote.courses) {
                                if (result.remote.courses.linux) count += result.remote.courses.linux.lessons.length;
                                if (result.remote.courses.python) count += result.remote.courses.python.lessons.length;
                                if (result.remote.courses.answers) count += result.remote.courses.answers.lessons.length;
                            }
                            saveLocalVersion(result.remote);
                            showUpdateNotification(count);
                        }
                    })
                    .catch(function(err) {
                        console.log('⚠️ خطا در چک آپدیت:', err);
                    });
            }, 3000);
        }

        console.log('🧀 CheeseUtils ready!');
    }

    // ============================================
    // ۱۱. نمایش نوتیف آپدیت
    // ============================================

// ============================================
// ۱۱. نمایش نوتیف آپدیت (ساده و بدون دانلود)
// ============================================

function showUpdateNotification(count) {
    if (document.getElementById('updateNotification')) return;

    var notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        left: 20px;
        max-width: 450px;
        margin: 0 auto;
        background: rgba(0, 10, 0, 0.95);
        border: 1px solid rgba(245, 184, 27, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        z-index: 9999;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        animation: slideUpNotif 0.4s ease;
        text-align: center;
        direction: rtl;
        font-family: 'Courier New', monospace;
    `;

    var style = document.createElement('style');
    style.textContent = `
        @keyframes slideUpNotif {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    notification.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📢</div>
        <h3 style="color: #f5b81b; margin-bottom: 0.5rem; font-size: 1.1rem;">آپدیت جدید موجود است!</h3>
        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 1.2rem;">
            ${count} فایل برای به‌روزرسانی آماده است.
        </p>
        <p style="color: rgba(255,255,255,0.15); font-size: 0.7rem; margin-bottom: 1.2rem;">
            برای دریافت آپدیت، لطفاً صفحه را رفرش کنید یا بعداً مراجعه کنید.
        </p>
        <div style="display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="location.reload()" style="
                background: rgba(245, 184, 27, 0.08);
                border: 1px solid rgba(245, 184, 27, 0.15);
                padding: 0.6rem 1.5rem;
                border-radius: 8px;
                color: #f5b81b;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                transition: all 0.3s ease;
            ">
                🔄 رفرش صفحه
            </button>
            <button onclick="this.closest('#updateNotification').remove()" style="
                background: transparent;
                border: 1px solid rgba(255,255,255,0.03);
                padding: 0.6rem 1.5rem;
                border-radius: 8px;
                color: rgba(255,255,255,0.2);
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                transition: all 0.3s ease;
            ">
                ⏰ بعداً
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // بعد از ۱۵ ثانیه خودکار بسته بشه
    setTimeout(function() {
        var notif = document.getElementById('updateNotification');
        if (notif) {
            notif.style.transition = 'opacity 0.5s ease';
            notif.style.opacity = '0';
            setTimeout(function() {
                if (notif.parentNode) notif.remove();
            }, 500);
        }
    }, 15000);
}

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();