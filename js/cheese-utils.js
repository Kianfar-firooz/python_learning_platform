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
    // ۷. دکمه کپی خودکار برای کدوبلاک‌ها
    // ============================================

    function setupCopyButtons() {
        var codeBlocks = document.querySelectorAll('pre, code, .code-block');

        codeBlocks.forEach(function(block) {
            // اگر والدش از قبل کانتینر کپی دارد، رد شو
            if (block.parentNode.classList && block.parentNode.classList.contains('code-wrapper')) {
                return;
            }

            // فقط تگ‌های pre یا بلوک‌های اصلی مد نظر هستند
            if (block.tagName.toLowerCase() === 'code' && block.parentNode.tagName.toLowerCase() === 'pre') {
                return; // مدیریت توسط pre انجام می‌شود
            }

            var wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            wrapper.style.position = 'relative';
            
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);

            var copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'کپی';
            copyBtn.style.cssText = `
                position: absolute;
                top: 8px;
                left: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-muted, #8892b0);
                font-family: var(--font-code, monospace);
                font-size: 0.75rem;
                padding: 0.3rem 0.6rem;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 10;
            `;

            copyBtn.addEventListener('click', function() {
                var textToCopy = block.innerText;
                navigator.clipboard.writeText(textToCopy).then(function() {
                    copyBtn.textContent = 'کپی شد! ✓';
                    copyBtn.style.color = 'var(--accent-green, #06d6a0)';
                    copyBtn.style.borderColor = 'var(--accent-green, #06d6a0)';

                    setTimeout(function() {
                        copyBtn.textContent = 'کپی';
                        copyBtn.style.color = '';
                        copyBtn.style.borderColor = '';
                    }, 2000);
                }).catch(function(err) {
                    console.error('خطا در کپی کردن متن:', err);
                });
            });

            wrapper.appendChild(copyBtn);
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
                    } else if (courseType === 'python') {
                        lessons = versionData.courses.python.lessons || [];
                        basePath = 'python-lessons/';
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
        setupCopyButtons: setupCopyButtons,
        
        toggleTheme: toggleTheme,
        loadTheme: loadTheme,
        
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
        setupCopyButtons();

        var themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }

        console.log('🧀 CheeseUtils ready with Copy feature!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
