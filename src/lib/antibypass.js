// Anti-bypass protection for Zipp links
// Prevents services like bypass.city from extracting destination URLs

// Generate a secure verification token
export const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Get browser fingerprint - basic implementation
export const getFingerprint = async () => {
    const data = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchSupport: 'ontouchstart' in window,
        webGL: getWebGLFingerprint(),
        canvas: await getCanvasFingerprint(),
    };

    // Generate hash
    const str = JSON.stringify(data);
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// WebGL fingerprint
const getWebGLFingerprint = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return null;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        } : null;
    } catch {
        return null;
    }
};

// Canvas fingerprint
const getCanvasFingerprint = async () => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = '#069';
        ctx.fillText('Zipp Verification 🔒', 2, 15);
        ctx.strokeStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.strokeText('Zipp Verification 🔒', 4, 17);

        return canvas.toDataURL().slice(-50); // Just last 50 chars for brevity
    } catch {
        return null;
    }
};

// Check if likely a bot
export const isLikelyBot = () => {
    const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /scrape/i, /curl/i, /wget/i,
        /python/i, /axios/i, /node-fetch/i, /phantom/i, /headless/i
    ];

    const ua = navigator.userAgent;

    // Check user agent for bot patterns
    if (botPatterns.some(pattern => pattern.test(ua))) return true;

    // Check for headless browser indicators
    if (navigator.webdriver) return true;
    if (!window.chrome && ua.includes('Chrome')) return true;
    if (navigator.plugins.length === 0 && !navigator.userAgent.includes('Mobile')) return true;

    // Check for automation frameworks
    if (window._phantom || window.__nightmare || window.callPhantom) return true;

    return false;
};

// Verify user interaction happened
export const createInteractionChallenge = () => {
    return new Promise((resolve) => {
        let hasMoved = false;
        let hasClicked = false;
        let startTime = Date.now();

        const checkInteraction = () => {
            const elapsed = Date.now() - startTime;
            // Must have some mouse movement and be on page for at least 3 seconds
            if ((hasMoved || hasClicked) && elapsed > 3000) {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('click', handleClick);
                document.removeEventListener('touchstart', handleClick);
                resolve(true);
            }
        };

        const handleMove = () => { hasMoved = true; checkInteraction(); };
        const handleClick = () => { hasClicked = true; checkInteraction(); };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('touchstart', handleClick);

        // Also check periodically
        const interval = setInterval(() => {
            if ((hasMoved || hasClicked) && Date.now() - startTime > 3000) {
                clearInterval(interval);
                resolve(true);
            }
        }, 1000);

        // Timeout after 30 seconds
        setTimeout(() => {
            clearInterval(interval);
            resolve(hasMoved || hasClicked);
        }, 30000);
    });
};

// Rate limiting helper (stored in localStorage)
export const checkRateLimit = (linkId, maxAttempts = 5, windowMs = 60000) => {
    const key = `zipp_rate_${linkId}`;
    const now = Date.now();

    try {
        const data = JSON.parse(localStorage.getItem(key) || '{"attempts":[],"blocked":false}');

        // Clean old attempts
        data.attempts = data.attempts.filter(t => now - t < windowMs);

        if (data.attempts.length >= maxAttempts) {
            data.blocked = true;
            localStorage.setItem(key, JSON.stringify(data));
            return { allowed: false, remaining: 0, blockedUntil: Math.max(...data.attempts) + windowMs };
        }

        // Add this attempt
        data.attempts.push(now);
        localStorage.setItem(key, JSON.stringify(data));

        return { allowed: true, remaining: maxAttempts - data.attempts.length };
    } catch {
        return { allowed: true, remaining: maxAttempts };
    }
};

// Verify request origin
export const verifyOrigin = () => {
    // Check if embedded in iframe
    if (window.self !== window.top) {
        return false;
    }

    // Check referrer for common bypass services
    const blockedReferrers = ['bypass.city', 'bypass.vip', 'linkvertise.bypass', 'thebypasser'];
    const referrer = document.referrer.toLowerCase();

    if (blockedReferrers.some(blocked => referrer.includes(blocked))) {
        return false;
    }

    return true;
};

// Main verification function
export const verifyAccess = async (linkId) => {
    const results = {
        isBot: isLikelyBot(),
        originValid: verifyOrigin(),
        rateLimit: checkRateLimit(linkId),
        fingerprint: await getFingerprint(),
        token: generateToken(),
        timestamp: Date.now()
    };

    // Calculate risk score (0-100)
    let riskScore = 0;
    if (results.isBot) riskScore += 50;
    if (!results.originValid) riskScore += 30;
    if (!results.rateLimit.allowed) riskScore += 20;

    return {
        ...results,
        riskScore,
        allowed: riskScore < 50
    };
};
