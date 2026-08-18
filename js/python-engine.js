// مدیریت کش و نمونه مفسر پایتون به صورت سراسری در تمام صفحات
window.pyodideInstance = null;
window.isPyodideLoading = false;

const CACHE_NAME = 'cheesecode-py-libs-v1';

// لیست کتابخانه‌هایی که کاربر می‌تواند مدیریت و دانلود کند
const AVAILABLE_LIBS = [
    { name: "numpy", url: "./wheels/numpy-1.26.4-cp311-cp311-emscripten_wasm32.whl" },
    { name: "requests", url: "./wheels/requests-2.31.0-py3-none-any.whl" }
];

async function initPythonEngine() {
    if (window.pyodideInstance) {
        return window.pyodideInstance;
    }
    
    if (window.isPyodideLoading) {
        while (window.isPyodideLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return window.pyodideInstance;
    }

    window.isPyodideLoading = true;
    console.log("⏳ در حال بارگذاری مفسر پایتون از روت سایت...");

    try {
        window.pyodideInstance = await loadPyodide({
            indexURL: "./pyodide/"
        });
        
        // بارگذاری micropip برای نصب پکیج‌ها
        await window.pyodideInstance.loadPackage("micropip");
        const micropip = window.pyodideInstance.importModule("micropip");

        // چک کردن کش مرورگر و نصب خودکار کتابخانه‌هایی که کاربر قبلاً دانلود کرده است
        const cache = await caches.open(CACHE_NAME);
        for (let lib of AVAILABLE_LIBS) {
            try {
                let cachedResponse = await cache.match(lib.url);
                if (cachedResponse) {
                    let blob = await cachedResponse.blob();
                    let fileBuffer = await blob.arrayBuffer();
                    
                    // نوشتن فایل در حافظه مجازی پایتون و نصب آن
                    window.pyodideInstance.FS.writeFile(lib.name + ".whl", new Uint8Array(fileBuffer));
                    await micropip.install(lib.name + ".whl");
                    console.log(`📦 کتابخانه محلی ${lib.name} از کش مرورگر روی پایتون نصب شد.`);
                }
            } catch (e) {
                console.warn(`خطا در لود کش کتابخانه ${lib.name}:`, e);
            }
        }

        console.log("✨ پایتون با موفقیت آماده و کتابخانه‌های کش‌شده بارگذاری شدند!");
    } catch (err) {
        console.error("❌ خطا در بارگذاری مفسر پایتون:", err);
    } finally {
        window.isPyodideLoading = false;
    }

    return window.pyodideInstance;
}

async function runPythonCode(userCode) {
    let pyodide = await initPythonEngine();
    if (!pyodide) {
        return "خطا در آماده‌سازی مفسر پایتون.";
    }

    try {
        pyodide.globals.set("__user_code", userCode);

        let safeWrapper = `
import sys
import io

__buffer = io.StringIO()
sys.stdout = __buffer

try:
    exec(__user_code, {})
    __result = __buffer.getvalue()
except Exception as e:
    __result = str(e)
`;

        await pyodide.runPythonAsync(safeWrapper);
        return pyodide.globals.get('__result').trim();
    } catch (err) {
        return "خطای اجرایی: " + err.message;
    }
}